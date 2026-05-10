import { CheckoutStatus } from '@dormarch/shared';
import { CheckoutRequest } from '../business/CheckoutRequest';
import { dbClient } from './DatabaseClient';

export class CheckoutRequestDB {
  private static mapRow(row: any): Partial<CheckoutRequest> {
    return {
      requestId: row.request_id,
      code: row.code,
      userEmail: row.user_email,
      userFullName: row.user_full_name,
      rentalFormId: row.refund_form_id,
      dormId: row.dorm_id,
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
      cr.code,
      cr.user_email,
      cr.refund_form_id,
      cr.expected_date,
      cr.status,
      cr.created_at,
      u.full_name as user_full_name,
      (SELECT d.id FROM rental_form_beds rfb JOIN beds b ON rfb.bed_id = b.id JOIN rooms r ON b.room_id = r.id JOIN dorms d ON r.dorm_id = d.id WHERE rfb.rental_form_id = cr.refund_form_id LIMIT 1) as dorm_id,
      (SELECT d.name FROM rental_form_beds rfb JOIN beds b ON rfb.bed_id = b.id JOIN rooms r ON b.room_id = r.id JOIN dorms d ON r.dorm_id = d.id WHERE rfb.rental_form_id = cr.refund_form_id LIMIT 1) as dorm_name,
      (SELECT r.floor FROM rental_form_beds rfb JOIN beds b ON rfb.bed_id = b.id JOIN rooms r ON b.room_id = r.id WHERE rfb.rental_form_id = cr.refund_form_id LIMIT 1) as floor,
      (SELECT r.name FROM rental_form_beds rfb JOIN beds b ON rfb.bed_id = b.id JOIN rooms r ON b.room_id = r.id WHERE rfb.rental_form_id = cr.refund_form_id LIMIT 1) as room_name,
      (SELECT STRING_AGG(b.bed_number, ', ') FROM rental_form_beds rfb JOIN beds b ON rfb.bed_id = b.id WHERE rfb.rental_form_id = cr.refund_form_id) as bed_numbers
    FROM checkout_requests cr
    LEFT JOIN users u ON cr.user_email = u.email
  `;

  static async getAll(dormId?: string): Promise<Partial<CheckoutRequest>[]> {
    let sql = `${this.BASE_QUERY}`;
    if (dormId) {
      sql += ` WHERE (SELECT d.id FROM rental_form_beds rfb JOIN beds b ON rfb.bed_id = b.id JOIN rooms r ON b.room_id = r.id JOIN dorms d ON r.dorm_id = d.id WHERE rfb.rental_form_id = cr.refund_form_id LIMIT 1) = $1`;
    }
    sql += ` ORDER BY cr.created_at DESC`;
    const result = await dbClient.query(sql, dormId ? [dormId] : []);
    return result.rows.map((row: any) => this.mapRow(row));
  }

  static async insert(request: CheckoutRequest): Promise<string | null> {
    const code = this.generateCode();
    const sql = `
      INSERT INTO checkout_requests (code, user_email, refund_form_id, expected_date, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const values = [
      code,
      request.userEmail, 
      request.rentalFormId ?? null, 
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

  private static generateCode(): string {
    const timestamp = new Date();
    const yearMonth = timestamp.getFullYear().toString().slice(-2) + String(timestamp.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `CHO-${yearMonth}-${random}`;
  }

  static async insertIfNoActiveRequest(request: CheckoutRequest, rentalFormId: string, userEmail: string): Promise<{ success: boolean; error?: string; requestId?: string }> {
    const code = this.generateCode();
    const sql = `
      INSERT INTO checkout_requests (code, user_email, refund_form_id, expected_date, status, created_at)
      SELECT $1, $2, $3, $4, $5, $6
      WHERE NOT EXISTS (
        SELECT 1 FROM checkout_requests 
        WHERE refund_form_id = $3 AND status::text IN ($7, $8, $9)
      )
      RETURNING id;
    `;
    
    const values = [
      code,
      request.userEmail, 
      request.rentalFormId ?? null, 
      request.expectedDate, 
      request.status, 
      request.createdAt || new Date().toISOString(),
      CheckoutStatus.PENDING,
      CheckoutStatus.PROCESSING,
      CheckoutStatus.LIQUIDATED
    ];

    try {
      const result = await dbClient.query(sql, values);
      
      if ((result.rowCount ?? 0) === 0) {
        return { success: false, error: 'Đã có yêu cầu trả phòng đang xử lý cho phiếu đăng ký này.' };
      }
      
      return { success: true, requestId: result.rows[0].id };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: `Lỗi cơ sở dữ liệu khi tạo yêu cầu. ${e.message}` };
    }
  }

  static async getById(requestId: string, dormId?: string): Promise<Partial<CheckoutRequest> | null> {
    let sql = `${this.BASE_QUERY} WHERE cr.id = $1`;
    const params: any[] = [requestId];
    if (dormId) {
      sql += ` AND (SELECT d.id FROM rental_form_beds rfb JOIN beds b ON rfb.bed_id = b.id JOIN rooms r ON b.room_id = r.id JOIN dorms d ON r.dorm_id = d.id WHERE rfb.rental_form_id = cr.refund_form_id LIMIT 1) = $2`;
      params.push(dormId);
    }
    sql += ` LIMIT 1`;
    const result = await dbClient.query(sql, params);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async getByUserEmail(userEmail: string, dormId?: string): Promise<Partial<CheckoutRequest>[]> {
    let sql = `${this.BASE_QUERY} WHERE cr.user_email = $1`;
    const params: any[] = [userEmail];
    if (dormId) {
      sql += ` AND (SELECT d.id FROM rental_form_beds rfb JOIN beds b ON rfb.bed_id = b.id JOIN rooms r ON b.room_id = r.id JOIN dorms d ON r.dorm_id = d.id WHERE rfb.rental_form_id = cr.refund_form_id LIMIT 1) = $2`;
      params.push(dormId);
    }
    sql += ` ORDER BY cr.created_at DESC`;
    const result = await dbClient.query(sql, params);
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
