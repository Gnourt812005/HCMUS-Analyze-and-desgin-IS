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

    const contracts = await Contract.getActiveByUserEmail(email);
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

contractRouter.get('/active-by-user/:email', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(400).json({ message: 'Email là bắt buộc.' });
    }

    const user = await User.getProfile(email);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    const contracts = await Contract.getActiveByUserEmail(email);
    res.status(200).json({ user, contracts });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

contractRouter.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const contract = await Contract.getByContractId(id);
    if (!contract) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});
