import { Contract } from '../business/Contract';
import { ContractStatus, CheckoutStatus } from '@dormarch/shared';
import { dbClient } from './DatabaseClient';

export class ContractDB {
  private static mapRow(row: any): Partial<Contract> {
    return {
      contractId: row.contract_id,
      userEmail: row.user_email,
      rentalFormId: row.rental_form_id,
      roomId: row.room_name, // Map room_name to roomId
      dormName: row.dorm_name,
      floor: row.floor,
      bedNumbers: row.bed_numbers,
      startDate: row.start_date,
      depositAmount: row.deposit_amount ? parseFloat(row.deposit_amount) : 0,
      stayDuration: row.stay_duration,
      signatureUrl: row.signature_url,
      status: row.status as ContractStatus,
      createdAt: row.created_at,
    };
  }

  private static readonly BASE_QUERY = `
    SELECT c.id as contract_id, c.user_email, c.rental_form_id, c.start_date, c.stay_duration, c.status, c.signature_url, c.created_at,
           (SELECT r.name 
            FROM contract_beds cb 
            JOIN beds b ON cb.bed_id = b.id 
            JOIN rooms r ON b.room_id = r.id 
            WHERE cb.contract_id = c.id 
            LIMIT 1) as room_name,
           (SELECT r.floor
            FROM contract_beds cb
            JOIN beds b ON cb.bed_id = b.id
            JOIN rooms r ON b.room_id = r.id
            WHERE cb.contract_id = c.id
            LIMIT 1) as floor,
           (SELECT d.name
            FROM contract_beds cb
            JOIN beds b ON cb.bed_id = b.id
            JOIN rooms r ON b.room_id = r.id
            JOIN dorms d ON r.dorm_id = d.id
            WHERE cb.contract_id = c.id
            LIMIT 1) as dorm_name,
           (SELECT STRING_AGG(b.bed_number, ', ')
            FROM contract_beds cb
            JOIN beds b ON cb.bed_id = b.id
            WHERE cb.contract_id = c.id) as bed_numbers,
           (SELECT rf.total_amount FROM rental_forms rf WHERE rf.id = c.rental_form_id) as deposit_amount
    FROM contracts c
  `;

  static async getByUserEmail(userEmail: string): Promise<Partial<Contract> | null> {
    const sql = `${this.BASE_QUERY} WHERE c.user_email = $1 LIMIT 1`;
    const result = await dbClient.query(sql, [userEmail]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async getByContractId(contractId: string): Promise<Partial<Contract> | null> {
    const sql = `${this.BASE_QUERY} WHERE c.id = $1 LIMIT 1`;
    const result = await dbClient.query(sql, [contractId]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async getActiveByUserEmail(userEmail: string): Promise<Partial<Contract>[]> {
    const sql = `
      ${this.BASE_QUERY} 
      WHERE c.user_email = $1 
        AND c.status = $2
        AND NOT EXISTS (
          SELECT 1 FROM checkout_requests cr 
          WHERE cr.contract_id = c.id AND cr.status IN ($3, $4)
        )
    `;
    const values = [userEmail, ContractStatus.ACTIVE, CheckoutStatus.PENDING, CheckoutStatus.PROCESSING];
    const result = await dbClient.query(sql, values);
    return result.rows.map(row => this.mapRow(row));
  }

  static async updateStatus(contractId: string, status: ContractStatus): Promise<boolean> {
    const sql = `UPDATE contracts SET status = $1 WHERE id = $2`;
    const result = await dbClient.query(sql, [status, contractId]);
    return result.rowCount > 0;
  }
}
