import { RefundCalculation } from "../business/RefundCalculation";
import { dbClient } from './DatabaseClient';

export class RefundDB {
  private static mapRow(row: any): Partial<RefundCalculation> {
    return {
      calculationId: row.id,
      requestId: row.request_id,
      rentalFormId: row.rental_form_id,
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
      (request_id, rental_form_id, deposit_amount, damage_fee, extra_fee, final_refund_amount, notes, created_at)
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
}
