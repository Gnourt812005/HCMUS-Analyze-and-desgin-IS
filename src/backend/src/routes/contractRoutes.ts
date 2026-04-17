import { Router } from 'express';
import { ContractDB } from '../database/ContractDB';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

export const contractRoutes = Router();

// GET /api/contracts — danh sách hợp đồng
contractRoutes.get('/', authMiddleware, async (_req, res) => {
  try {
    const data = await ContractDB.getAll();
    res.json({ message: 'Success', status: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', status: 500, data: [] });
  }
});

// GET /api/contracts/orders — danh sách đơn đăng ký thuê (cho dropdown)
contractRoutes.get('/orders', authMiddleware, async (_req, res) => {
  try {
    const data = await ContractDB.getOrders();
    res.json({ message: 'Success', status: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', status: 500, data: [] });
  }
});

// POST /api/contracts — tạo hợp đồng mới
contractRoutes.post('/', authMiddleware, async (req, res) => {
  try {
    const { orderId, startDate, endDate, paymentPeriod, depositAmount, beds } = req.body;

    if (!orderId || !startDate || !endDate || !paymentPeriod || !beds?.length) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc', status: 400 });
    }

    const id = await ContractDB.create({
      orderId, startDate, endDate, paymentPeriod,
      depositAmount: Number(depositAmount) || 0,
      beds,
      customerEmail: '', // lấy từ depositreceipt trong DB
    });

    res.json({ message: 'Tạo hợp đồng thành công', status: 200, data: { id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', status: 500 });
  }
});

// PUT /api/contracts/:id — cập nhật hợp đồng
contractRoutes.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, phone, cccd, startDate, endDate } = req.body;
    await ContractDB.update(id, { customerName, phone, cccd, startDate, endDate });
    res.json({ message: 'Cập nhật thành công', status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', status: 500 });
  }
});

// PATCH /api/contracts/:id/cancel — huỷ hợp đồng
contractRoutes.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    await ContractDB.cancel(req.params.id);
    res.json({ message: 'Huỷ hợp đồng thành công', status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', status: 500 });
  }
});
