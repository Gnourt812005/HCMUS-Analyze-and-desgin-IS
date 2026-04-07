import { Router } from 'express';
import { User } from '../business/User';
import { SignInDTO, SignUpDTO } from '@dormarch/shared';

const router = Router();

router.post('/sign-in', async (req, res) => {
  try {
    const data: SignInDTO = req.body;
    if (!data.email || !data.password) {
      return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu' });
    }

    const authResult = await User.signIn(data);
    if (!authResult) {
      return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }

    res.json(authResult);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.post('/sign-up', async (req, res) => {
  try {
    const data: SignUpDTO = req.body;
    if (!data.email || !data.password) {
      return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu' });
    }

    const success = await User.signUp(data);
    if (success) {
      res.status(201).json({ message: 'Đăng ký thành công' });
    }
  } catch (error: any) {
    // Return 400 for errors like email exists
    res.status(400).json({ message: error.message });
  }
});

export default router;
