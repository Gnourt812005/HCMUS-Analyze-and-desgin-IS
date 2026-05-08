import { RefundCalculation } from "../business/RefundCalculation";
import { dbClient } from './DatabaseClient';

export class RefundDB {
  private static mapRow(row: any): Partial<RefundCalculation> {
    return {
      calculationId: row.id,
      requestId: row.request_id,
      depositAmount: Number(row.deposit_amount || 0),
      damageFee: Number(row.damage_fee || 0),
      extraFee: Number(row.extra_fee || 0),
      finalRefundAmount: Number(row.final_refund_amount || 0),
      notes: row.notes,
      createdAt: row.created_at
    };
  }

  static async getByRequestId(requestId: string): Promise<Partial<RefundCalculation> | null> {
    const sql = `SELECT * FROM refund_calculations WHERE request_id = $1 LIMIT 1`;
    const result = await dbClient.query(sql, [requestId]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async getById(calculationId: string): Promise<Partial<RefundCalculation> | null> {
    const sql = `SELECT * FROM refund_calculations WHERE id = $1 LIMIT 1`;
    const result = await dbClient.query(sql, [calculationId]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async create(data: Partial<RefundCalculation>): Promise<Partial<RefundCalculation>> {
    const sql = `
      INSERT INTO refund_calculations 
      (request_id, refund_form_id, deposit_amount, damage_fee, extra_fee, final_refund_amount, notes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    const values = [
      data.requestId,
      data.rentalFormId,
      data.depositAmount || 0,
      data.damageFee || 0,
      data.extraFee || 0,
      data.finalRefundAmount || 0,
      data.notes || ''
    ];
    const result = await dbClient.query(sql, values);
    return this.mapRow(result.rows[0]);
  }

  static async update(calculationId: string, data: Partial<RefundCalculation>): Promise<Partial<RefundCalculation> | null> {
    const sql = `
      UPDATE refund_calculations
      SET deposit_amount = COALESCE($1, deposit_amount),
          damage_fee = COALESCE($2, damage_fee),
          extra_fee = COALESCE($3, extra_fee),
          final_refund_amount = COALESCE($4, final_refund_amount),
          notes = COALESCE($5, notes)
      WHERE id = $6 RETURNING *
    `;
    const values = [data.depositAmount, data.damageFee, data.extraFee, data.finalRefundAmount, data.notes, calculationId];
    const result = await dbClient.query(sql, values);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async getRentalFormData(rentalFormId: string): Promise<{ id: string; type: 'DEPOSIT' | 'FULL'; totalAmount: number } | null> {
    try {
      const result = await dbClient.query(
        'SELECT id, type, total_amount FROM rental_forms WHERE id = $1::uuid',
        [rentalFormId]
      );
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        type: row.type as 'DEPOSIT' | 'FULL',
        totalAmount: row.total_amount
      };
    } catch (error) {
      console.error('Error fetching rental form:', error);
      return null;
    }
  }

  static async getContractData(contractId: string): Promise<{ id: string; startDate: string; stayDuration: number } | null> {
    try {
      const result = await dbClient.query(
        'SELECT id, start_date, stay_duration FROM contracts WHERE id = $1::uuid',
        [contractId]
      );
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        startDate: row.start_date,
        stayDuration: row.stay_duration
      };
    } catch (error) {
      console.error('Error fetching contract:', error);
      return null;
    }
  }

  static async getActiveRentalFormsForCheckout(userEmail: string): Promise<any[]> {
    const sql = `
      SELECT
        rf.id as rental_form_id,
        rf.type,
        rf.total_amount,
        rf.deadline,
        c.id as contract_id,
        c.start_date,
        c.stay_duration,
        (SELECT full_name FROM users WHERE email = $1 LIMIT 1) as user_full_name,
        (SELECT d.name FROM rental_form_beds rfb JOIN beds b ON b.id = rfb.bed_id JOIN rooms r ON r.id = b.room_id JOIN dorms d ON d.id = r.dorm_id WHERE rfb.rental_form_id = rf.id LIMIT 1) as dorm_name,
        (SELECT r.name FROM rental_form_beds rfb JOIN beds b ON b.id = rfb.bed_id JOIN rooms r ON r.id = b.room_id WHERE rfb.rental_form_id = rf.id LIMIT 1) as room_name,
        (SELECT r.floor FROM rental_form_beds rfb JOIN beds b ON b.id = rfb.bed_id JOIN rooms r ON r.id = b.room_id WHERE rfb.rental_form_id = rf.id LIMIT 1) as floor,
        (SELECT STRING_AGG(b.bed_number, ', ') FROM rental_form_beds rfb JOIN beds b ON b.id = rfb.bed_id WHERE rfb.rental_form_id = rf.id) as bed_numbers
      FROM rental_forms rf
      LEFT JOIN contracts c ON c.rental_form_id = rf.id
      WHERE rf.user_email = $1
      AND NOT EXISTS (
        SELECT 1 FROM checkout_requests 
        WHERE refund_form_id = rf.id AND status IN ('PENDING', 'PROCESSING', 'LIQUIDATED')
      )
      ORDER BY rf.created_at DESC
    `;
    const result = await dbClient.query(sql, [userEmail]);
    return result.rows;
  }

  static async getPaymentAmount(rentalFormId: string): Promise<number> {
    try {
      const result = await dbClient.query(
        "SELECT SUM(amount) as paid FROM payments WHERE rental_form_id = $1::uuid AND status = 'SUCCESS'",
        [rentalFormId]
      );
      return Number(result.rows[0]?.paid || 0);
    } catch (error) {
      console.error('Error fetching payment amount:', error);
      return 0;
    }
  }

  static async getRentalFormById(rentalFormId: string): Promise<{ id: string; userEmail: string; type: 'DEPOSIT' | 'FULL'; totalAmount: number } | null> {
    try {
      const result = await dbClient.query(
        'SELECT id, user_email, type, total_amount FROM rental_forms WHERE id = $1::uuid',
        [rentalFormId]
      );
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        userEmail: row.user_email,
        type: row.type as 'DEPOSIT' | 'FULL',
        totalAmount: row.total_amount
      };
    } catch (error) {
      console.error('Error fetching rental form:', error);
      return null;
    }
  }
}
