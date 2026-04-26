import { Router, Request, Response } from 'express';
import { Handover } from '../business/Handover';

export const handoverRoutes = Router();

handoverRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const data = await Handover.getAll();
    res.json({ message: 'Success', status: 200, data });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

// Must be registered before /:id to avoid conflict
handoverRoutes.get('/by-contract/:contractId', async (req: Request, res: Response) => {
  try {
    const data = await Handover.getByContractId(req.params.contractId);
    res.json({ message: 'Success', status: 200, data });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

handoverRoutes.get('/active-contracts', async (req: Request, res: Response) => {
  try {
    const data = await Handover.getActiveContracts();
    res.json({ message: 'Success', status: 200, data });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

handoverRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await Handover.getById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Không tìm thấy biên bản', status: 404 });
    res.json({ message: 'Success', status: 200, data });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

handoverRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const id = await Handover.create(req.body);
    res.status(201).json({ message: 'Tạo biên bản thành công', status: 201, data: { id } });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi tạo biên bản', status: 400 });
  }
});
