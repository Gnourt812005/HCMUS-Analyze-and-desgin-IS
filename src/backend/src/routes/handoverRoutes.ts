import { Router } from 'express';
import { HandoverDB } from '../database/HandoverDB';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import pool from '../database/db';

export const handoverRoutes = Router();

// GET /api/handover — danh sách biên bản bàn giao
handoverRoutes.get('/', authMiddleware, async (_req, res) => {
  try {
    const data = await HandoverDB.getAll();
    res.json({ message: 'Success', status: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', status: 500, data: [] });
  }
});

// GET /api/handover/contracts — hợp đồng đang hiệu lực (cho dropdown)
handoverRoutes.get('/contracts', authMiddleware, async (_req, res) => {
  try {
    const data = await HandoverDB.getActiveContracts();
    res.json({ message: 'Success', status: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', status: 500, data: [] });
  }
});

// POST /api/handover — tạo biên bản bàn giao
handoverRoutes.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { contractId, type, note, beds } = req.body;

    if (!contractId || !type || !beds?.length) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc', status: 400 });
    }

    // Lấy employeeId từ JWT (email → lookup)
    let employeeId: string | null = null;
    if (req.user?.email) {
      const { rows } = await pool.query(
        'SELECT employeeid FROM employee WHERE email=$1',
        [req.user.email]
      );
      employeeId = rows[0]?.employeeid ?? null;
    }

    const id = await HandoverDB.create({ contractId, employeeId, type, note: note ?? '', beds });
    res.json({ message: 'Tạo biên bản thành công', status: 200, data: { id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', status: 500 });
  }
});
