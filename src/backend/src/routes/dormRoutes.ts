import { Router } from 'express';
import { Dorm } from '../business/Dorm';
import { RentalDB } from '../database/RentalDB';

export const dormRoutes = Router();

// GET / - List dorms (supports ?keyword=...)
dormRoutes.get('/', async (req, res) => {
  try {
    const keyword = req.query.keyword as string;
    const dorms = await Dorm.getAll(keyword);
    res.json({ message: 'Success', status: 200, data: dorms });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500, data: [] });
  }
});

// GET /:id - Get dorm detail
dormRoutes.get('/:id', async (req, res) => {
  try {
    const dorm = await Dorm.getById(req.params.id);
    if (!dorm) {
      return res.status(404).json({ message: 'Không tìm thấy ký túc xá', status: 404 });
    }
    res.json({ message: 'Success', status: 200, data: dorm });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

// POST / - Create new dorm
dormRoutes.post('/', async (req, res) => {
  try {
    const success = await Dorm.create(req.body);
    res.json({ message: 'Thêm mới thành công', status: 201, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Lỗi khi tạo mới', status: 500 });
  }
});

// PUT /:id - Update dorm
dormRoutes.put('/:id', async (req, res) => {
  try {
    const success = await Dorm.update(req.params.id, req.body);
    res.json({ message: 'Cập nhật thành công', status: 200, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Lỗi khi cập nhật', status: 500 });
  }
});

// DELETE /:id - Delete dorm (Soft delete)
dormRoutes.delete('/:id', async (req, res) => {
  try {
    const success = await Dorm.delete(req.params.id);
    res.json({ message: 'Đã ẩn ký túc xá', status: 200, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Lỗi khi xóa', status: 500 });
  }
});

/**
 * EXISTING ROUTE - DO NOT REMOVE
 * GET /:dormId/rooms - List rooms in a dorm
 */
dormRoutes.get('/:dormId/rooms', async (req, res) => {
  try {
    const rooms = await RentalDB.listRoomBedsByDorm(req.params.dormId);
    res.json({ message: 'Success', status: 200, data: rooms });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Cannot fetch rooms', status: 500, data: [] });
  }
});
