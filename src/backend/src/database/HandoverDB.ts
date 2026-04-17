import pool from './db';

export class HandoverDB {
  // ── List all handover reports ─────────────────────────────────────────────
  static async getAll() {
    const { rows } = await pool.query(`
      SELECT
        hr.reportid                         AS id,
        hr.contractid                       AS "contractId",
        cu.fullname                         AS "customerName",
        dr.roomid                           AS room,
        hr.type,
        hr.note,
        TO_CHAR(hr.createddate, 'YYYY-MM-DD') AS "createdDate",
        COALESCE(e.fullname, 'Staff')       AS "createdBy",
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'bedName',       hbd.bedid,
            'bedStatus',     hbd.bedstatus,
            'mattressStatus',hbd.mattressstatus,
            'cabinetStatus', hbd.cabinetstatus,
            'keyStatus',     hbd.keystatus
          ) ORDER BY hbd.bedid
        )                                   AS beds
      FROM handoverreport hr
      JOIN contract       c   ON c.contractid   = hr.contractid
      JOIN customer       cu  ON cu.customerid    = c.customerid
      JOIN depositreceipt dr  ON dr.depositid    = c.depositid
      JOIN handoverbeddetail hbd ON hbd.reportid = hr.reportid
      LEFT JOIN employee  e   ON e.employeeid    = hr.employeeid
      GROUP BY hr.reportid, hr.contractid, cu.fullname, dr.roomid,
               hr.type, hr.note, hr.createddate, e.fullname
      ORDER BY hr.createddate DESC NULLS LAST
    `);
    return rows;
  }

  // ── Active contracts for dropdown ─────────────────────────────────────────
  static async getActiveContracts() {
    const { rows } = await pool.query(`
      SELECT
        c.contractid                          AS id,
        cu.fullname                           AS "customerName",
        dr.roomid                             AS room,
        ARRAY_AGG(cb.bedid ORDER BY cb.bedid) AS beds
      FROM contract c
      JOIN customer       cu ON cu.customerid  = c.customerid
      JOIN depositreceipt dr ON dr.depositid  = c.depositid
      JOIN contractbed    cb ON cb.contractid = c.contractid
      WHERE c.status = 'Active'
      GROUP BY c.contractid, cu.fullname, dr.roomid
      ORDER BY c.contractid
    `);
    return rows;
  }

  // ── Create handover report ────────────────────────────────────────────────
  static async create(data: {
    contractId: string;
    employeeId: string | null;
    type:       string;
    note:       string;
    beds: {
      bedName:        string;
      bedStatus:      string;
      mattressStatus: string;
      cabinetStatus:  string;
      keyStatus:      string;
    }[];
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: cnt } = await client.query('SELECT COUNT(*) FROM handoverreport');
      const id = `BB${String(Number(cnt[0].count) + 1).padStart(3, '0')}`;

      await client.query(
        `INSERT INTO handoverreport (reportid, contractid, employeeid, type, createddate, note)
         VALUES ($1,$2,$3,$4,CURRENT_DATE,$5)`,
        [id, data.contractId, data.employeeId, data.type, data.note]
      );

      for (const bed of data.beds) {
        await client.query(
          `INSERT INTO handoverbeddetail
             (reportid, bedid, bedstatus, mattressstatus, cabinetstatus, keystatus)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [id, bed.bedName, bed.bedStatus, bed.mattressStatus,
           bed.cabinetStatus, bed.keyStatus]
        );
      }

      await client.query('COMMIT');
      return id;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
