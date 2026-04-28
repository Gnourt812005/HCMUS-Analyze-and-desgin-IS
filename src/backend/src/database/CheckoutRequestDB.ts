import { CheckoutStatus } from '@dormarch/shared';
import { CheckoutRequest } from '../business/CheckoutRequest';
import { dbClient } from './DatabaseClient';

export class CheckoutRequestDB {
  private static mapRow(row: any): Partial<CheckoutRequest> {
    return {
      requestId: row.request_id,
      userEmail: row.user_email,
      userFullName: row.user_full_name,
      contractId: row.contract_id,
      dormName: row.dorm_name,
      roomName: row.room_name,
      floor: row.floor,
      bedNumbers: row.bed_numbers,
      expectedDate: row.expected_date,
      status: row.status as CheckoutStatus,
      createdAt: row.created_at
    };
  }

  private static readonly BASE_QUERY = `
    SELECT
      cr.id as request_id,
      cr.user_email,
      cr.contract_id,
      cr.expected_date,
      cr.status,
      cr.created_at,
      u.full_name as user_full_name,
      (SELECT d.name FROM contracts c JOIN contract_beds cb ON c.id = cb.contract_id JOIN beds b ON cb.bed_id = b.id JOIN rooms r ON b.room_id = r.id JOIN dorms d ON r.dorm_id = d.id WHERE c.id = cr.contract_id LIMIT 1) as dorm_name,
      (SELECT r.floor FROM contracts c JOIN contract_beds cb ON c.id = cb.contract_id JOIN beds b ON cb.bed_id = b.id JOIN rooms r ON b.room_id = r.id WHERE c.id = cr.contract_id LIMIT 1) as floor,
      (SELECT r.name FROM contracts c JOIN contract_beds cb ON c.id = cb.contract_id JOIN beds b ON cb.bed_id = b.id JOIN rooms r ON b.room_id = r.id WHERE c.id = cr.contract_id LIMIT 1) as room_name,
      (SELECT STRING_AGG(b.bed_number, ', ') FROM contracts c JOIN contract_beds cb ON c.id = cb.contract_id JOIN beds b ON cb.bed_id = b.id WHERE c.id = cr.contract_id) as bed_numbers
    FROM checkout_requests cr
    LEFT JOIN users u ON cr.user_email = u.email
  `;

  static async getAll(): Promise<Partial<CheckoutRequest>[]> {
    const sql = `${this.BASE_QUERY} ORDER BY cr.created_at DESC`;
    const result = await dbClient.query(sql);
    return result.rows.map((row: any) => this.mapRow(row));
  }

  static async insert(request: CheckoutRequest): Promise<string | null> {
    const sql = `
      INSERT INTO checkout_requests (user_email, contract_id, expected_date, status, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const values = [
      request.userEmail, 
      request.contractId ?? null, 
      request.expectedDate,
      request.status, 
      request.createdAt || new Date().toISOString()
    ];
    try {
      const result = await dbClient.query(sql, values);
      return result.rows[0]?.id || null;
    } catch (e) {
      console.error("Database insert failed:", e);
      return null;
    }
  }

  static async insertIfNoActiveRequest(request: CheckoutRequest, contractId: string, userEmail: string): Promise<{ success: boolean; error?: string; requestId?: string }> {
    const sql = `
      INSERT INTO checkout_requests (user_email, contract_id, expected_date, status, created_at)
      SELECT $1, $2, $3, $4, $5
      WHERE NOT EXISTS (
        SELECT 1 FROM checkout_requests 
        WHERE contract_id = $2 AND status::text IN ($6, $7)
      )
      RETURNING id;
    `;
    
    const values = [
      request.userEmail, 
      request.contractId ?? null, 
      request.expectedDate, 
      request.status, 
      request.createdAt || new Date().toISOString(),
      CheckoutStatus.PENDING,
      CheckoutStatus.PROCESSING
    ];

    try {
      const result = await dbClient.query(sql, values);
      
      if ((result.rowCount ?? 0) === 0) {
        return { success: false, error: 'Đã có yêu cầu trả phòng đang xử lý cho hợp đồng này.' };
      }
      
      return { success: true, requestId: result.rows[0].id };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: `Lỗi cơ sở dữ liệu khi tạo yêu cầu. ${e.message}` };
    }
  }

  static async getById(requestId: string): Promise<Partial<CheckoutRequest> | null> {
    const sql = `${this.BASE_QUERY} WHERE cr.id = $1 LIMIT 1`;
    const result = await dbClient.query(sql, [requestId]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async getByUserEmail(userEmail: string): Promise<Partial<CheckoutRequest>[]> {
    const sql = `${this.BASE_QUERY} WHERE cr.user_email = $1 ORDER BY cr.created_at DESC`;
    const result = await dbClient.query(sql, [userEmail]);
    return result.rows.map((row: any) => this.mapRow(row));
  }

  static async updateStatus(requestId: string, newStatus: CheckoutStatus, expectedStatus?: CheckoutStatus): Promise<boolean> {
    const sql = expectedStatus 
      ? `UPDATE checkout_requests SET status = $1 WHERE id = $2 AND status = $3` 
      : `UPDATE checkout_requests SET status = $1 WHERE id = $2`;
    
    const values = expectedStatus ? [newStatus, requestId, expectedStatus] : [newStatus, requestId];
    const result = await dbClient.query(sql, values);
    
    return (result.rowCount ?? 0) > 0;
  }
}
