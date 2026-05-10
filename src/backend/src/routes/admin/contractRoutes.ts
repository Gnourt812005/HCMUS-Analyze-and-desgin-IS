import { Router, Request, Response } from 'express';
import { User } from '../../business/User';
import { Contract } from '../../business/Contract';

export const contractRouter = Router();

// ─── Admin routes (/api/contracts/admin/...) ──────────────────────────────────

contractRouter.get('/all', async (_req: Request, res: Response) => {
  try {
    const data = await Contract.getAll();
    res.json({ message: 'Success', status: 200, data });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

contractRouter.get('/rental-forms', async (_req: Request, res: Response) => {
  try {
    const data = await Contract.getRentalFormsWithoutContract();
    res.json({ message: 'Success', status: 200, data });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

contractRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { rentalFormId, startDate, stayDuration } = req.body;
    if (!rentalFormId) return res.status(400).json({ message: 'rentalFormId là bắt buộc' });
    if (!startDate) return res.status(400).json({ message: 'startDate là bắt buộc' });
    if (startDate < new Date().toISOString().split('T')[0]) return res.status(400).json({ message: 'Ngày bắt đầu không được nhỏ hơn ngày hiện tại' });
    if (!stayDuration || stayDuration < 1) return res.status(400).json({ message: 'stayDuration phải >= 1 tháng' });
    const id = await Contract.insert(rentalFormId, startDate, stayDuration);
    res.status(201).json({ message: 'Lập hợp đồng thành công', status: 201, data: { id } });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi tạo hợp đồng', status: 400 });
  }
});

contractRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { startDate, stayDuration } = req.body;
    if (!startDate || !stayDuration) return res.status(400).json({ message: 'startDate và stayDuration là bắt buộc' });
    if (startDate < new Date().toISOString().split('T')[0]) return res.status(400).json({ message: 'Ngày bắt đầu không được nhỏ hơn ngày hiện tại' });
    const ok = await Contract.adminUpdate(req.params.id, startDate, stayDuration);
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    res.json({ message: 'Cập nhật thành công', status: 200 });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

contractRouter.patch('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const ok = await Contract.cancel(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    res.json({ message: 'Đã huỷ hợp đồng', status: 200 });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

// ─── Shared Detail routes ──────────────────────────────────

contractRouter.get('/active-by-user/:email', async (req: Request, res: Response) => {
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

contractRouter.get('/:id/fees', async (req: Request, res: Response) => {
  try {
    const fees = await Contract.getFeesByContractId(req.params.id);
    if (!fees) return res.status(404).json({ message: 'Không tìm thấy thông tin phí' });
    res.status(200).json({ message: 'Success', status: 200, data: fees });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

contractRouter.get('/by-rental-form/:rentalFormId', async (req: Request, res: Response) => {
  try {
    const { rentalFormId } = req.params;
    const contract = await Contract.getByRentalFormId(rentalFormId);
    if (!contract) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng cho đơn đăng ký này' });
    }
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

contractRouter.get('/:id', async (req: Request, res: Response) => {
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
