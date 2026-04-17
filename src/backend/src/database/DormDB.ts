import pool from './db';

export class DormDB {
  static async getAll() {
    const { rows } = await pool.query(`
      SELECT
        d.dormid                                          AS id,
        d.name,
        d.address,
        d.hotline                                         AS phone,
        d.status,
        COUNT(b.bedid)                                    AS "totalRooms",
        COUNT(b.bedid) FILTER (WHERE b.status = 'Available') AS "availableRooms"
      FROM dorm d
      LEFT JOIN room r ON r.dormid = d.dormid
      LEFT JOIN bed  b ON b.roomid = r.roomid
      GROUP BY d.dormid, d.name, d.address, d.hotline, d.status
      ORDER BY d.dormid
    `);
    return rows;
  }
}
