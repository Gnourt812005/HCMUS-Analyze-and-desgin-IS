import { Router } from 'express';
import { DormDB } from '../database/DormDB';
import pool from '../database/db';

export const dormRoutes = Router();

dormRoutes.get('/', async (_req, res) => {
  try {
    const dorms = await DormDB.getAll();
    res.json({ message: 'Success', status: 200, data: dorms });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', status: 500, data: [] });
  }
});

// GET /api/dorms/:dormId/rooms — danh sách giường theo KTX (phục vụ trang đặt phòng)
dormRoutes.get('/:dormId/rooms', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        r.roomid                                          AS "roomId",
        b.bedid                                           AS "bedId",
        r.name || ' - Giường ' || b.bedid                AS title,
        b.baseprice                                       AS price,
        CASE WHEN b.status = 'Available' THEN 1 ELSE 0 END AS available
      FROM room r
      JOIN bed b ON b.roomid = r.roomid
      WHERE r.dormid = $1
      ORDER BY r.roomid, b.bedid
    `, [req.params.dormId]);

    res.json({ message: 'Success', status: 200, data: rows });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Cannot fetch rooms', status: 500, data: [] });
  }
});
