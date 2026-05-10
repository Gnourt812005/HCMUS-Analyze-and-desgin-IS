import { Router, Response, NextFunction } from 'express';
import { Dorm } from '../../business/Dorm';
import { DormFee } from '../../business/DormFee';
import { RentalDB } from '../../database/RentalDB';
import { AuthRequest, authorize } from '../../middleware/authMiddleware';
import { UserRole } from '@dormarch/shared';

export const dormRoutes = Router();

/**
 * Middleware to ensure Managers only access their own dorm.
 * Admins bypass this check.
 */
const checkDormOwnership = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  // Use id or dormId depending on the route parameter name
  const requestedDormId = req.params.id || req.params.dormId;

  if (user?.role === UserRole.ADMIN) return next();

  if (user?.role === UserRole.MANAGER && user.dormId === requestedDormId) {
    return next();
  }

  return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này trên ký túc xá khác' });
};

// GET / - List dorms
dormRoutes.get('/', async (req: AuthRequest, res) => {
  const dormId = req.user?.dormId;
  if (dormId && req.user?.role === UserRole.MANAGER) {
    const dorm = await Dorm.getById(dormId);
    return res.json({ message: 'Success', status: 200, data: { dorms: [dorm], total: dorm ? 1 : 0 } });
  }
  try {
    const query = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      keyword: req.query.keyword as string,
      status: req.query.status as string
    };
    const result = await Dorm.getAll(query);
    res.json({ message: 'Success', status: 200, data: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500, data: { dorms: [], total: 0 } });
  }
});

// GET /:id - Get dorm detail
dormRoutes.get('/:id', checkDormOwnership, async (req: AuthRequest, res) => {
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

// POST / - Create new dorm (ADMIN ONLY)
dormRoutes.post('/', authorize(UserRole.ADMIN), async (req, res) => {
  try {
    const success = await Dorm.create(req.body);
    res.json({ message: 'Thêm mới thành công', status: 201, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Lỗi khi tạo mới', status: 500 });
  }
});

// PUT /:id - Update dorm
dormRoutes.put('/:id', checkDormOwnership, async (req: AuthRequest, res) => {
  try {
    const success = await Dorm.update(req.params.id, req.body);
    res.json({ message: 'Cập nhật thành công', status: 200, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Lỗi khi cập nhật', status: 500 });
  }
});

// DELETE /:id - Delete dorm
dormRoutes.delete('/:id', authorize(UserRole.ADMIN), async (req, res) => {
  try {
    const success = await Dorm.delete(req.params.id);
    res.json({ message: 'Đã ẩn ký túc xá', status: 200, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Lỗi khi xóa', status: 500 });
  }
});

// GET /:id/fees - Get dorm fees
dormRoutes.get('/:id/fees', checkDormOwnership, async (req: AuthRequest, res) => {
  try {
    const fees = await DormFee.getByDormId(req.params.id);
    res.json({ message: 'Success', status: 200, data: fees ? fees.toDTO() : null });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Lỗi khi lấy thông tin phí', status: 500 });
  }
});

// PUT /:id/fees - Update dorm fees
dormRoutes.put('/:id/fees', checkDormOwnership, async (req: AuthRequest, res) => {
  try {
    const success = await DormFee.update(req.params.id, req.body);
    res.json({ message: 'Cập nhật phí thành công', status: 200, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Lỗi khi cập nhật phí', status: 500 });
  }
});

// GET /:dormId/rooms - List rooms in a dorm
dormRoutes.get('/:dormId/rooms', checkDormOwnership, async (req: AuthRequest, res) => {
  try {
    const rooms = await RentalDB.listRoomBedsByDorm(req.params.dormId);
    res.json({ message: 'Success', status: 200, data: rooms });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Cannot fetch rooms', status: 500, data: [] });
  }
});
