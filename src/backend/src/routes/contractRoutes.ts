import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { User } from '../business/User';
import { Contract } from '../business/Contract';

export const contractRouter = Router();

contractRouter.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({ message: 'Không thể định danh' });
    }

    const profile = await User.getProfile(email);
    if (!profile?.cccd) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng' });
    }

    const contracts = await Contract.getActiveByUserCCCD(profile.cccd);
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

contractRouter.get('/active-by-user/:cccd', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const cccd = req.params.cccd;
    if (!cccd) {
      return res.status(400).json({ message: 'CCCD là bắt buộc.' });
    }

    const user = await User.getProfileByCCCD(cccd);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    const contracts = await Contract.getActiveByUserCCCD(cccd);
    res.status(200).json({ user, contracts });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});
