import { Router } from 'express';
import { User } from '../business/User';
import { UserProfileDTO, ChangePasswordDTO } from '@dormarch/shared';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
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

router.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
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

router.patch('/profile/password', authMiddleware, async (req: AuthRequest, res) => {
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

export default router;
