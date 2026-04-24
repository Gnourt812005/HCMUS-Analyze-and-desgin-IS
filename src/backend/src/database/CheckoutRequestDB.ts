import { CheckoutStatus } from '@dormarch/shared';
import { CheckoutRequest } from '../business/CheckoutRequest';
import { dbClient } from './DatabaseClient';

export class CheckoutRequestDB {
  private static mapRow(row: any): Partial<CheckoutRequest> {
    return {
      requestId: row.id,
      userEmail: row.user_email,
      contractId: row.contract_id,
      expectedDate: row.expected_date,
      status: row.status as CheckoutStatus,
      handoverId: row.handover_id,
      createdAt: row.created_at
    };
  }

  static async getAll(): Promise<Partial<CheckoutRequest>[]> {
    const sql = `SELECT * FROM checkout_requests ORDER BY created_at DESC`;
    const result = await dbClient.query(sql);
    return result.rows.map(row => this.mapRow(row));
  }

  static async insert(request: CheckoutRequest): Promise<string | null> {
    const sql = `
      INSERT INTO checkout_requests (user_email, contract_id, expected_date, status, handover_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const values = [
      request.userEmail, 
      request.contractId ?? null, 
      request.expectedDate,
      request.status, 
      request.handoverId ?? null, 
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
      INSERT INTO checkout_requests (user_email, contract_id, expected_date, status, handover_id, created_at)
      SELECT $1, $2, $3, $4, $5, $6
      WHERE NOT EXISTS (
        SELECT 1 FROM checkout_requests 
        WHERE contract_id = $2 AND status::text IN ($7, $8)
      )
      RETURNING id;
    `;
    
    const values = [
      request.userEmail, 
      request.contractId ?? null, 
      request.expectedDate, 
      request.status, 
      request.handoverId ?? null, 
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
    const sql = `SELECT * FROM checkout_requests WHERE id = $1 LIMIT 1`;
    const result = await dbClient.query(sql, [requestId]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
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
