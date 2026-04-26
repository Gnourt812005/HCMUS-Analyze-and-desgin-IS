import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { User } from '../business/User';
import { Contract } from '../business/Contract';
import { ContractDB } from '../database/ContractDB';

export const contractRouter = Router();

// ─── Admin routes (/api/contracts/admin/...) ──────────────────────────────────

contractRouter.get('/admin/all', async (_req: Request, res: Response) => {
  try {
    const data = await ContractDB.getAll();
    res.json({ message: 'Success', status: 200, data });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

contractRouter.get('/admin/rental-forms', async (_req: Request, res: Response) => {
  try {
    const data = await ContractDB.getRentalFormsWithoutContract();
    res.json({ message: 'Success', status: 200, data });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

contractRouter.post('/admin', async (req: Request, res: Response) => {
  try {
    const { rentalFormId, startDate, stayDuration } = req.body;
    if (!rentalFormId) return res.status(400).json({ message: 'rentalFormId là bắt buộc' });
    if (!startDate)    return res.status(400).json({ message: 'startDate là bắt buộc' });
    if (!stayDuration || stayDuration < 1) return res.status(400).json({ message: 'stayDuration phải >= 1 tháng' });
    const id = await ContractDB.insert(rentalFormId, startDate, stayDuration);
    res.status(201).json({ message: 'Lập hợp đồng thành công', status: 201, data: { id } });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi tạo hợp đồng', status: 400 });
  }
});

contractRouter.put('/admin/:id', async (req: Request, res: Response) => {
  try {
    const { startDate, stayDuration } = req.body;
    if (!startDate || !stayDuration) return res.status(400).json({ message: 'startDate và stayDuration là bắt buộc' });
    const ok = await ContractDB.adminUpdate(req.params.id, startDate, stayDuration);
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    res.json({ message: 'Cập nhật thành công', status: 200 });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

contractRouter.patch('/admin/:id/cancel', async (req: Request, res: Response) => {
  try {
    const ok = await ContractDB.cancel(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    res.json({ message: 'Đã huỷ hợp đồng', status: 200 });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

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
