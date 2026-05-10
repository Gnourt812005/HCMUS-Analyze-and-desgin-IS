import { Router } from 'express';
import { User } from '../../business/User';
import { UserProfileDTO, ChangePasswordDTO, UserDTO } from '@dormarch/shared';
import { AuthRequest, adminMiddleware } from '../../middleware/authMiddleware';

const router = Router();

router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: 'Không thể định danh' });

    const profile = await User.getProfile(email);
    if (!profile) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.put('/profile', async (req: AuthRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: 'Không thể định danh' });

    const data: UserProfileDTO = req.body;
    const success = await User.updateProfile(email, data);

    if (success) {
      res.json({ message: 'Cập nhật hồ sơ thành công' });
    } else {
      res.status(400).json({ message: 'Cập nhật thất bại' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.patch('/profile/password', async (req: AuthRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: 'Không thể định danh' });

    const data: ChangePasswordDTO = req.body;
    const success = await User.changePassword(email, data);

    if (success) {
      res.json({ message: 'Đổi mật khẩu thành công' });
    } else {
      res.status(400).json({ message: 'Đổi mật khẩu thất bại' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// STAFF MANAGEMENT
router.get('/staff', adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const keyword = req.query.keyword as string;
    const staff = await User.getAllEmployees({ keyword });
    res.json({ data: staff });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.get('/staff/:email', adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const staff = await User.getEmployeeByEmail(req.params.email);
    if (!staff) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    res.json({ data: staff });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.post('/staff', adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const data: UserDTO = req.body;
    const success = await User.upsertEmployee(data);
    res.json({ success, message: 'Lưu thông tin nhân viên thành công' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/staff/:email', adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const success = await User.deleteEmployee(req.params.email);
    res.json({ success, message: 'Xóa nhân viên thành công' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
