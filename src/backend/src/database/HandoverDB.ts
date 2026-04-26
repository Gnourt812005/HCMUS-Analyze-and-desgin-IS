import { dbClient } from './DatabaseClient';

export type HandoverType = 'IN' | 'OUT';
export type EquipmentStatus = 'Tốt' | 'Hư hỏng' | 'Mất';

export interface HandoverBedRow {
  bedId: string;
  bedNumber: string;
  bedStatus: EquipmentStatus;
  mattressStatus: EquipmentStatus;
  cabinetStatus: EquipmentStatus;
  keyStatus: EquipmentStatus;
}

export interface HandoverRow {
  id: string;
  contractId: string;
  customerName: string;
  roomName: string;
  type: HandoverType;
  createdAt: string;
  beds: HandoverBedRow[];
  note: string;
}

export interface ActiveContractRow {
  contractId: string;
  customerName: string;
  roomName: string;
  beds: { id: string; bedNumber: string }[];
}

export interface CreateHandoverBed {
  bedId: string;
  bedStatus: EquipmentStatus;
  mattressStatus: EquipmentStatus;
  cabinetStatus: EquipmentStatus;
  keyStatus: EquipmentStatus;
}

export class HandoverDB {
  static async getAll(): Promise<HandoverRow[]> {
    const result = await dbClient.query(`
      SELECT
        h.id,
        h.contract_id,
        h.type,
        h.created_at,
        u.full_name  AS customer_name,
        (
          SELECT MIN(r2.name)
          FROM contract_beds cb2
          JOIN beds b2  ON b2.id  = cb2.bed_id
          JOIN rooms r2 ON r2.id  = b2.room_id
          WHERE cb2.contract_id = h.contract_id
        ) AS room_name,
        COALESCE(
          json_agg(
            json_build_object(
              'bedId',     hb.bed_id,
              'bedNumber', b.bed_number,
              'note',      hb.note
            ) ORDER BY b.bed_number
          ) FILTER (WHERE hb.bed_id IS NOT NULL),
          '[]'::json
        ) AS beds
      FROM handovers h
      JOIN contracts c           ON h.contract_id  = c.id
      JOIN users u               ON c.user_email   = u.email
      LEFT JOIN handover_beds hb ON hb.handover_id = h.id
      LEFT JOIN beds b           ON b.id           = hb.bed_id
      GROUP BY h.id, u.full_name
      ORDER BY h.created_at DESC
    `);
    return result.rows.map((row: any) => this.mapRow(row));
  }

  static async getByContractId(contractId: string): Promise<HandoverRow[]> {
    const result = await dbClient.query(`
      SELECT
        h.id,
        h.contract_id,
        h.type,
        h.created_at,
        u.full_name  AS customer_name,
        (
          SELECT MIN(r2.name)
          FROM contract_beds cb2
          JOIN beds b2  ON b2.id  = cb2.bed_id
          JOIN rooms r2 ON r2.id  = b2.room_id
          WHERE cb2.contract_id = h.contract_id
        ) AS room_name,
        COALESCE(
          json_agg(
            json_build_object(
              'bedId',     hb.bed_id,
              'bedNumber', b.bed_number,
              'note',      hb.note
            ) ORDER BY b.bed_number
          ) FILTER (WHERE hb.bed_id IS NOT NULL),
          '[]'::json
        ) AS beds
      FROM handovers h
      JOIN contracts c           ON h.contract_id  = c.id
      JOIN users u               ON c.user_email   = u.email
      LEFT JOIN handover_beds hb ON hb.handover_id = h.id
      LEFT JOIN beds b           ON b.id           = hb.bed_id
      WHERE h.contract_id = $1
      GROUP BY h.id, u.full_name
      ORDER BY h.created_at ASC
    `, [contractId]);
    return result.rows.map((row: any) => this.mapRow(row));
  }

  static async getById(id: string): Promise<HandoverRow | null> {
    const result = await dbClient.query(`
      SELECT
        h.id,
        h.contract_id,
        h.type,
        h.created_at,
        u.full_name  AS customer_name,
        (
          SELECT MIN(r2.name)
          FROM contract_beds cb2
          JOIN beds b2  ON b2.id  = cb2.bed_id
          JOIN rooms r2 ON r2.id  = b2.room_id
          WHERE cb2.contract_id = h.contract_id
        ) AS room_name,
        COALESCE(
          json_agg(
            json_build_object(
              'bedId',     hb.bed_id,
              'bedNumber', b.bed_number,
              'note',      hb.note
            ) ORDER BY b.bed_number
          ) FILTER (WHERE hb.bed_id IS NOT NULL),
          '[]'::json
        ) AS beds
      FROM handovers h
      JOIN contracts c           ON h.contract_id  = c.id
      JOIN users u               ON c.user_email   = u.email
      LEFT JOIN handover_beds hb ON hb.handover_id = h.id
      LEFT JOIN beds b           ON b.id           = hb.bed_id
      WHERE h.id = $1
      GROUP BY h.id, u.full_name
    `, [id]);
    if (!result.rows[0]) return null;
    return this.mapRow(result.rows[0]);
  }

  static async getActiveContracts(): Promise<ActiveContractRow[]> {
    const result = await dbClient.query(`
      SELECT
        c.id         AS contract_id,
        u.full_name  AS customer_name,
        r.name       AS room_name,
        json_agg(
          json_build_object('id', b.id, 'bedNumber', b.bed_number)
          ORDER BY b.bed_number
        ) AS beds
      FROM contracts c
      JOIN users u          ON c.user_email   = u.email
      JOIN contract_beds cb ON cb.contract_id = c.id
      JOIN beds b           ON b.id           = cb.bed_id
      JOIN rooms r          ON r.id           = b.room_id
      WHERE c.status = 'ACTIVE'
      GROUP BY c.id, u.full_name, r.name
      ORDER BY u.full_name
    `);
    return result.rows.map((row: any) => ({
      contractId: row.contract_id,
      customerName: row.customer_name,
      roomName: row.room_name,
      beds: row.beds || [],
    }));
  }

  static async insert(
    contractId: string,
    type: HandoverType,
    beds: CreateHandoverBed[],
    overallNote: string,
  ): Promise<string> {
    const client = await dbClient.getClient();
    try {
      await client.query('BEGIN');

      const insertResult = await client.query(
        'INSERT INTO handovers (contract_id, type) VALUES ($1, $2) RETURNING id',
        [contractId, type],
      );
      const handoverId = insertResult.rows[0].id;

      for (const bed of beds) {
        const noteJson = JSON.stringify({
          bedStatus: bed.bedStatus,
          mattressStatus: bed.mattressStatus,
          cabinetStatus: bed.cabinetStatus,
          keyStatus: bed.keyStatus,
          overallNote,
        });
        await client.query(
          'INSERT INTO handover_beds (handover_id, bed_id, note) VALUES ($1, $2, $3)',
          [handoverId, bed.bedId, noteJson],
        );
      }

      await client.query('COMMIT');
      return handoverId;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  private static mapRow(row: any): HandoverRow {
    const rawBeds: any[] = (row.beds || []).filter((b: any) => b.bedId != null);

    const overallNote = rawBeds.length > 0
      ? (() => { try { return JSON.parse(rawBeds[0].note || '{}').overallNote || ''; } catch { return ''; } })()
      : '';

    const beds: HandoverBedRow[] = rawBeds.map((b: any) => {
      let parsed: any = {};
      try { parsed = JSON.parse(b.note || '{}'); } catch { /* ignore */ }
      return {
        bedId: b.bedId,
        bedNumber: b.bedNumber,
        bedStatus: parsed.bedStatus || 'Tốt',
        mattressStatus: parsed.mattressStatus || 'Tốt',
        cabinetStatus: parsed.cabinetStatus || 'Tốt',
        keyStatus: parsed.keyStatus || 'Tốt',
      };
    });

    return {
      id: row.id,
      contractId: row.contract_id,
      customerName: row.customer_name,
      roomName: row.room_name,
      type: row.type as HandoverType,
      createdAt: row.created_at,
      note: overallNote,
      beds,
    };
  }
}
