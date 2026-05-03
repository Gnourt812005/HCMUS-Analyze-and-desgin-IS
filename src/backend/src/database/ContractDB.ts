import {
  CheckoutStatus,
  ContractStatus,
  ContractDTO,
  ContractAdminDTO,
  RentalFormOptionDTO,
  DormFeesDTO,
} from '@dormarch/shared';
import { dbClient } from './DatabaseClient';

export class ContractDB {

  // ── Admin: list all contracts ──────────────────────────────────────────────

  static async getAll(): Promise<ContractAdminDTO[]> {
    const result = await dbClient.query(`
      SELECT
        c.id,
        c.contract_code,
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
        ) AS bed_numbers,
        COALESCE(SUM(b.price), 0) AS monthly_rent
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

  static async getRentalFormsWithoutContract(): Promise<RentalFormOptionDTO[]> {
    const result = await dbClient.query(`
      SELECT
        rf.id,
        rf.total_amount,
        rf.created_at,
        rf.deadline,
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
        ) AS bed_numbers,
        COALESCE(SUM(b.price), 0) AS monthly_rent
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
    return result.rows.map((row: any) => {
      const rentalMonths = Math.max(1, Math.round(
        (new Date(row.deadline).getTime() - new Date(row.created_at).getTime())
        / (30 * 24 * 60 * 60 * 1000)
      ));
      return {
        id: row.id,
        customerName: row.full_name,
        phone: row.phone || null,
        cccd: row.cccd || null,
        roomName: row.room_name || null,
        bedNumbers: row.bed_numbers || [],
        monthlyRent: parseFloat(row.monthly_rent) || 0,
        rentalMonths,
        totalAmount: parseFloat(row.total_amount) || 0,
        createdAt: row.created_at,
      };
    });
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

      // Snapshot fees tại thời điểm tạo hợp đồng
      const feesResult = await client.query(`
        SELECT df.electricity_fee, df.water_fee, df.wifi_fee, df.cleaning_fee
        FROM rental_form_beds rfb
        JOIN beds b   ON b.id   = rfb.bed_id
        JOIN rooms r  ON r.id   = b.room_id
        JOIN dorms d  ON d.id   = r.dorm_id
        JOIN dorm_fees df ON df.dorm_id = d.id
        WHERE rfb.rental_form_id = $1
        LIMIT 1
      `, [rentalFormId]);
      const feesRow = feesResult.rows[0];
      const feesSnapshot = feesRow ? {
        electricityFee: parseFloat(feesRow.electricity_fee) || 0,
        waterFee:       parseFloat(feesRow.water_fee)       || 0,
        wifiFee:        parseFloat(feesRow.wifi_fee)        || 0,
        cleaningFee:    parseFloat(feesRow.cleaning_fee)    || 0,
      } : null;

      const contractResult = await client.query(
        `INSERT INTO contracts (user_email, start_date, stay_duration, rental_form_id, status, fees_snapshot)
         VALUES ($1, $2, $3, $4, 'ACTIVE', $5) RETURNING id`,
        [user_email, startDate, stayDuration, rentalFormId, feesSnapshot ? JSON.stringify(feesSnapshot) : null],
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

  // ── User: query methods ────────────────────────────────────────────────────

  static async getByContractId(contractId: string): Promise<ContractDTO | null> {
    const sql = `${this.BASE_QUERY} WHERE c.id = $1 LIMIT 1`;
    const result = await dbClient.query(sql, [contractId]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async getByUserEmail(userEmail: string): Promise<ContractDTO | null> {
    const sql = `${this.BASE_QUERY} WHERE c.user_email = $1 LIMIT 1`;
    const result = await dbClient.query(sql, [userEmail]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async getAllByUserEmail(userEmail: string): Promise<ContractDTO[]> {
    const sql = `${this.BASE_QUERY} WHERE c.user_email = $1 ORDER BY c.created_at DESC`;
    const result = await dbClient.query(sql, [userEmail]);
    return result.rows.map((row: any) => this.mapRow(row));
  }

  static async getActiveByUserEmail(userEmail: string): Promise<ContractDTO[]> {
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
    return result.rows.map((row: any) => this.mapRow(row));
  }

  static async getBedsInfoByContractId(contractId: string): Promise<{ roomId: string; bedIds: string[] } | null> {
    const result = await dbClient.query(`
      SELECT
        b.room_id,
        array_agg(b.id) as bed_ids
      FROM contract_beds cb
      JOIN beds b ON cb.bed_id = b.id
      WHERE cb.contract_id = $1
      GROUP BY b.room_id
    `, [contractId]);

    if (result.rows.length === 0) return null;
    return {
      roomId: result.rows[0].room_id,
      bedIds: result.rows[0].bed_ids,
    };
  }

  static async getFeesByContractId(contractId: string): Promise<DormFeesDTO | null> {
    const result = await dbClient.query(`
      SELECT
        CASE WHEN c.fees_snapshot IS NOT NULL
          THEN (c.fees_snapshot->>'electricityFee')::numeric
          ELSE df.electricity_fee
        END AS electricity_fee,
        CASE WHEN c.fees_snapshot IS NOT NULL
          THEN (c.fees_snapshot->>'waterFee')::numeric
          ELSE df.water_fee
        END AS water_fee,
        CASE WHEN c.fees_snapshot IS NOT NULL
          THEN (c.fees_snapshot->>'wifiFee')::numeric
          ELSE df.wifi_fee
        END AS wifi_fee,
        CASE WHEN c.fees_snapshot IS NOT NULL
          THEN (c.fees_snapshot->>'cleaningFee')::numeric
          ELSE df.cleaning_fee
        END AS cleaning_fee
      FROM contracts c
      LEFT JOIN contract_beds cb ON cb.contract_id = c.id
      LEFT JOIN beds b           ON b.id           = cb.bed_id
      LEFT JOIN rooms r          ON r.id           = b.room_id
      LEFT JOIN dorms d          ON d.id           = r.dorm_id
      LEFT JOIN dorm_fees df     ON df.dorm_id     = d.id
      WHERE c.id = $1
      LIMIT 1
    `, [contractId]);
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      electricityFee: parseFloat(row.electricity_fee) || 0,
      waterFee:       parseFloat(row.water_fee)       || 0,
      wifiFee:        parseFloat(row.wifi_fee)        || 0,
      cleaningFee:    parseFloat(row.cleaning_fee)    || 0,
    };
  }

  static async updateStatus(contractId: string, status: ContractStatus): Promise<boolean> {
    const result = await dbClient.query(
      'UPDATE contracts SET status = $1 WHERE id = $2',
      [status, contractId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private static readonly BASE_QUERY = `
    SELECT
      c.id           AS contract_id,
      c.contract_code,
      c.user_email,
      c.rental_form_id,
      c.start_date,
      c.stay_duration,
      c.status,
      c.signature_url,
      c.created_at,
      (SELECT r.name
       FROM contract_beds cb JOIN beds b ON cb.bed_id = b.id JOIN rooms r ON b.room_id = r.id
       WHERE cb.contract_id = c.id LIMIT 1) AS room_name,
      (SELECT r.floor
       FROM contract_beds cb JOIN beds b ON cb.bed_id = b.id JOIN rooms r ON b.room_id = r.id
       WHERE cb.contract_id = c.id LIMIT 1) AS floor,
      (SELECT d.name
       FROM contract_beds cb JOIN beds b ON cb.bed_id = b.id JOIN rooms r ON b.room_id = r.id JOIN dorms d ON r.dorm_id = d.id
       WHERE cb.contract_id = c.id LIMIT 1) AS dorm_name,
      (SELECT STRING_AGG(b.bed_number, ', ')
       FROM contract_beds cb JOIN beds b ON cb.bed_id = b.id
       WHERE cb.contract_id = c.id) AS bed_numbers,
      (SELECT COALESCE(SUM(b.price), 0)
       FROM contract_beds cb JOIN beds b ON cb.bed_id = b.id
       WHERE cb.contract_id = c.id) AS monthly_rent,
      (SELECT rf.total_amount FROM rental_forms rf WHERE rf.id = c.rental_form_id) AS deposit_amount
    FROM contracts c
  `;

  private static mapRow(row: any): ContractDTO {
    return {
      contractId: row.contract_id,
      contractCode: row.contract_code || undefined,
      userEmail: row.user_email,
      rentalFormId: row.rental_form_id || undefined,
      roomName: row.room_name || undefined,
      dormName: row.dorm_name || undefined,
      floor: row.floor ?? undefined,
      bedNumbers: row.bed_numbers || undefined,
      monthlyRent: row.monthly_rent ? parseFloat(row.monthly_rent) : undefined,
      startDate: row.start_date || undefined,
      depositAmount: row.deposit_amount ? parseFloat(row.deposit_amount) : undefined,
      stayDuration: row.stay_duration || undefined,
      signatureUrl: row.signature_url || undefined,
      status: row.status as ContractStatus,
      createdAt: row.created_at,
    };
  }

  private static mapAdminRow(row: any): ContractAdminDTO {
    return {
      id: row.id,
      contractCode: row.contract_code || null,
      userEmail: row.user_email,
      rentalFormId: row.rental_form_id || null,
      startDate: row.start_date instanceof Date
        ? row.start_date.toISOString().split('T')[0]
        : String(row.start_date),
      stayDuration: row.stay_duration || 1,
      status: row.status,
      signatureUrl: row.signature_url || null,
      createdAt: row.created_at,
      customerName: row.full_name,
      phone: row.phone || null,
      cccd: row.cccd || null,
      roomName: row.room_name || null,
      bedNumbers: row.bed_numbers || [],
      monthlyRent: parseFloat(row.monthly_rent) || 0,
    };
  }
}
