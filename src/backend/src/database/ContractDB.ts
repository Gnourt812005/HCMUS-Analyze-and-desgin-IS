import pool from './db';

// DB status  ↔  UI status
const TO_UI: Record<string, string> = {
  Active:    'Hiệu lực',
  Expired:   'Hết hạn',
  Cancelled: 'Đã huỷ',
};
const TO_DB: Record<string, string> = {
  'Hiệu lực': 'Active',
  'Hết hạn':  'Expired',
  'Đã huỷ':   'Cancelled',
};

export class ContractDB {
  // ── List all contracts ────────────────────────────────────────────────────
  static async getAll() {
    const { rows } = await pool.query(`
      SELECT
        c.contractid                        AS id,
        c.depositid                         AS "orderId",
        cu.fullname                         AS "customerName",
        cu.phone,
        cu.cccd,
        dr.roomid                           AS room,
        ARRAY_AGG(cb.bedid ORDER BY cb.bedid) AS beds,
        TO_CHAR(c.startdate,  'YYYY-MM-DD') AS "startDate",
        TO_CHAR(c.enddate,    'YYYY-MM-DD') AS "endDate",
        c.paymentperiod                     AS "paymentPeriod",
        c.status,
        TO_CHAR(c.signeddate, 'YYYY-MM-DD') AS "createdDate",
        c.depositamount                     AS "depositAmount"
      FROM contract c
      JOIN customer        cu ON cu.customerid = c.customerid
      JOIN depositreceipt  dr ON dr.depositid  = c.depositid
      JOIN contractbed     cb ON cb.contractid = c.contractid
      GROUP BY c.contractid, cu.fullname, cu.phone, cu.cccd,
               dr.roomid, c.startdate, c.enddate, c.paymentperiod,
               c.status, c.signeddate, c.depositamount
      ORDER BY c.signeddate DESC NULLS LAST
    `);

    return rows.map(r => ({ ...r, status: TO_UI[r.status] ?? r.status }));
  }

  // ── List rental orders (DepositReceipt Paid) — dùng cho dropdown ─────────
  static async getOrders() {
    const { rows } = await pool.query(`
      SELECT
        dr.depositid                          AS id,
        cu.fullname                           AS "customerName",
        cu.phone,
        cu.cccd,
        dr.roomid                             AS room,
        ARRAY_AGG(b.bedid ORDER BY b.bedid)   AS beds,
        dr.depositamount                      AS "depositAmount"
      FROM depositreceipt dr
      JOIN customer cu ON cu.customerid = dr.customerid
      JOIN bed      b  ON b.roomid   = dr.roomid
      WHERE dr.status = 'Paid'
      GROUP BY dr.depositid, cu.fullname, cu.phone, cu.cccd,
               dr.roomid, dr.depositamount
      ORDER BY dr.createddate DESC NULLS LAST
    `);
    return rows;
  }

  // ── Create contract ───────────────────────────────────────────────────────
  static async create(data: {
    orderId:       string;
    customerEmail: string;
    startDate:     string;
    endDate:       string;
    paymentPeriod: string;
    depositAmount: number;
    beds:          string[];
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Generate ID
      const { rows: cnt } = await client.query('SELECT COUNT(*) FROM contract');
      const id = `HD${String(Number(cnt[0].count) + 1).padStart(3, '0')}`;

      // Insert contract
      await client.query(
        `INSERT INTO contract
           (contractid, depositid, customerid, signeddate, startdate, enddate,
            paymentperiod, depositamount, status)
         VALUES ($1,$2,
           (SELECT customerid FROM depositreceipt WHERE depositid=$2),
           CURRENT_DATE,$3,$4,$5,$6,'Active')`,
        [id, data.orderId, data.startDate, data.endDate,
         data.paymentPeriod, data.depositAmount]
      );

      // Insert beds
      for (const bedId of data.beds) {
        await client.query(
          'INSERT INTO contractbed (contractid, bedid) VALUES ($1, $2)',
          [id, bedId]
        );
        await client.query(
          "UPDATE bed SET status='Occupied' WHERE bedid=$1",
          [bedId]
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

  // ── Update contract (name, phone, cccd, dates) ────────────────────────────
  static async update(id: string, data: {
    customerName: string;
    phone:        string;
    cccd:         string;
    startDate:    string;
    endDate:      string;
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE customer SET fullname=$1, phone=$2, cccd=$3
         WHERE customerid=(SELECT customerid FROM contract WHERE contractid=$4)`,
        [data.customerName, data.phone, data.cccd, id]
      );
      await client.query(
        'UPDATE contract SET startdate=$1, enddate=$2 WHERE contractid=$3',
        [data.startDate, data.endDate, id]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ── Cancel contract ───────────────────────────────────────────────────────
  static async cancel(id: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        "UPDATE contract SET status='Cancelled' WHERE contractid=$1",
        [id]
      );
      await client.query(
        "UPDATE bed SET status='Available' WHERE bedid IN (SELECT bedid FROM contractbed WHERE contractid=$1)",
        [id]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
