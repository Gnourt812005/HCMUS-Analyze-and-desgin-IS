import { Contract } from '../business/Contract';
import { ContractStatus } from '@dormarch/shared';
import { dbClient } from './DatabaseClient';

// ─── Types for admin queries ──────────────────────────────────────────────────

export interface ContractAdminRow {
  id: string;
  userEmail: string;
  rentalFormId: string | null;
  startDate: string;
  stayDuration: number;
  status: ContractStatus;
  signatureUrl: string | null;
  createdAt: string;
  customerName: string;
  phone: string | null;
  cccd: string | null;
  roomName: string | null;
  bedNumbers: string[];
}

export interface RentalFormOption {
  id: string;
  customerName: string;
  phone: string | null;
  cccd: string | null;
  roomName: string | null;
  bedNumbers: string[];
  totalAmount: number;
  createdAt: string;
}

// ─── ContractDB ───────────────────────────────────────────────────────────────

export class ContractDB {

  // ── Admin: list all contracts ──────────────────────────────────────────────

  static async getAll(): Promise<ContractAdminRow[]> {
    const result = await dbClient.query(`
      SELECT
        c.id,
        c.user_email,
        c.rental_form_id,
        c.start_date,
        c.stay_duration,
        c.status,
        c.signature_url,
        c.created_at,
        u.full_name,
        u.phone,
        u.cccd,
        (
          SELECT MIN(r2.name)
          FROM contract_beds cb2
          JOIN beds b2  ON b2.id  = cb2.bed_id
          JOIN rooms r2 ON r2.id  = b2.room_id
          WHERE cb2.contract_id = c.id
        ) AS room_name,
        COALESCE(
          json_agg(b.bed_number ORDER BY b.bed_number)
            FILTER (WHERE b.bed_number IS NOT NULL),
          '[]'::json
        ) AS bed_numbers
      FROM contracts c
      JOIN users u           ON c.user_email   = u.email
      LEFT JOIN contract_beds cb ON cb.contract_id = c.id
      LEFT JOIN beds b           ON b.id           = cb.bed_id
      GROUP BY c.id, u.full_name, u.phone, u.cccd
      ORDER BY c.created_at DESC
    `);
    return result.rows.map(this.mapAdminRow);
  }

  // ── Admin: rental forms without a contract ─────────────────────────────────

  static async getRentalFormsWithoutContract(): Promise<RentalFormOption[]> {
    const result = await dbClient.query(`
      SELECT
        rf.id,
        rf.total_amount,
        rf.created_at,
        u.full_name,
        u.phone,
        u.cccd,
        (
          SELECT MIN(r2.name)
          FROM rental_form_beds rfb2
          JOIN beds b2  ON b2.id  = rfb2.bed_id
          JOIN rooms r2 ON r2.id  = b2.room_id
          WHERE rfb2.rental_form_id = rf.id
        ) AS room_name,
        COALESCE(
          json_agg(b.bed_number ORDER BY b.bed_number)
            FILTER (WHERE b.bed_number IS NOT NULL),
          '[]'::json
        ) AS bed_numbers
      FROM rental_forms rf
      JOIN users u ON rf.user_email = u.email
      LEFT JOIN rental_form_beds rfb ON rfb.rental_form_id = rf.id
      LEFT JOIN beds b               ON b.id               = rfb.bed_id
      WHERE rf.id NOT IN (
        SELECT rental_form_id FROM contracts WHERE rental_form_id IS NOT NULL
      )
      GROUP BY rf.id, u.full_name, u.phone, u.cccd
      ORDER BY rf.created_at DESC
    `);
    return result.rows.map((row: any) => ({
      id: row.id,
      customerName: row.full_name,
      phone: row.phone || null,
      cccd: row.cccd || null,
      roomName: row.room_name || null,
      bedNumbers: row.bed_numbers || [],
      totalAmount: parseFloat(row.total_amount) || 0,
      createdAt: row.created_at,
    }));
  }

  // ── Admin: create contract from rental form ────────────────────────────────

  static async insert(rentalFormId: string, startDate: string, stayDuration: number): Promise<string> {
    const client = await dbClient.getClient();
    try {
      await client.query('BEGIN');

      const rfResult = await client.query(
        'SELECT user_email FROM rental_forms WHERE id = $1',
        [rentalFormId],
      );
      if (!rfResult.rows[0]) throw new Error('Không tìm thấy phiếu đăng ký thuê');
      const { user_email } = rfResult.rows[0];

      const contractResult = await client.query(
        `INSERT INTO contracts (user_email, start_date, stay_duration, rental_form_id, status)
         VALUES ($1, $2, $3, $4, 'ACTIVE') RETURNING id`,
        [user_email, startDate, stayDuration, rentalFormId],
      );
      const contractId = contractResult.rows[0].id;

      await client.query(
        `INSERT INTO contract_beds (contract_id, bed_id)
         SELECT $1, bed_id FROM rental_form_beds WHERE rental_form_id = $2`,
        [contractId, rentalFormId],
      );

      await client.query('COMMIT');
      return contractId;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ── Admin: update contract dates ───────────────────────────────────────────

  static async adminUpdate(id: string, startDate: string, stayDuration: number): Promise<boolean> {
    const result = await dbClient.query(
      'UPDATE contracts SET start_date = $1, stay_duration = $2 WHERE id = $3',
      [startDate, stayDuration, id],
    );
    return (result.rowCount ?? 0) > 0;
  }

  // ── Admin: cancel contract ─────────────────────────────────────────────────

  static async cancel(id: string): Promise<boolean> {
    const result = await dbClient.query(
      `UPDATE contracts SET status = 'TERMINATED' WHERE id = $1`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }

  // ── Legacy methods (used by Contract business class & checkout routes) ──────

  static async getByUserCCCD(userCCCD: string): Promise<Partial<Contract> | null> {
    const result = await dbClient.query(
      `SELECT c.id AS "contractId", u.cccd AS "userCCCD",
              c.start_date AS "startDate", c.stay_duration AS "stayDuration",
              c.status, c.signature_url AS "liquidationUrl"
       FROM contracts c
       JOIN users u ON c.user_email = u.email
       WHERE u.cccd = $1
       LIMIT 1`,
      [userCCCD],
    );
    return result.rows[0] || null;
  }

  static async getByContractId(contractId: string): Promise<Partial<Contract> | null> {
    const result = await dbClient.query(
      `SELECT c.id AS "contractId", u.cccd AS "userCCCD",
              c.start_date AS "startDate", c.stay_duration AS "stayDuration",
              c.status, c.signature_url AS "liquidationUrl"
       FROM contracts c
       JOIN users u ON c.user_email = u.email
       WHERE c.id = $1`,
      [contractId],
    );
    return result.rows[0] || null;
  }

  static async getActiveByUserCCCD(userCCCD: string): Promise<Partial<Contract>[]> {
    const result = await dbClient.query(
      `SELECT c.id AS "contractId", u.cccd AS "userCCCD",
              c.start_date AS "startDate", c.stay_duration AS "stayDuration",
              c.status, c.signature_url AS "liquidationUrl"
       FROM contracts c
       JOIN users u ON c.user_email = u.email
       WHERE u.cccd = $1 AND c.status IN ('ACTIVE', 'PENDING_CHECKOUT')`,
      [userCCCD],
    );
    return result.rows;
  }

  static async updateLiquidationUrl(contractId: string, liquidationUrl: string): Promise<boolean> {
    const result = await dbClient.query(
      'UPDATE contracts SET signature_url = $1 WHERE id = $2',
      [liquidationUrl, contractId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async updateStatus(contractId: string, status: ContractStatus): Promise<boolean> {
    const result = await dbClient.query(
      'UPDATE contracts SET status = $1 WHERE id = $2',
      [status, contractId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private static mapAdminRow(row: any): ContractAdminRow {
    return {
      id: row.id,
      userEmail: row.user_email,
      rentalFormId: row.rental_form_id,
      startDate: row.start_date instanceof Date
        ? row.start_date.toISOString().split('T')[0]
        : String(row.start_date),
      stayDuration: row.stay_duration || 1,
      status: row.status as ContractStatus,
      signatureUrl: row.signature_url,
      createdAt: row.created_at,
      customerName: row.full_name,
      phone: row.phone || null,
      cccd: row.cccd || null,
      roomName: row.room_name || null,
      bedNumbers: row.bed_numbers || [],
    };
  }
}
