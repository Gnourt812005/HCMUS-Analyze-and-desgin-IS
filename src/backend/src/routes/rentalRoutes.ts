import { Router } from 'express';
import {
  PaymentPreviewRequestDTO,
  PolicyAgreementRequestDTO,
  RentalEligibilityRequestDTO,
  RentalRegistrationRequestDTO
} from '@dormarch/shared';
import { Rental } from '../business/Rental';
import { Policy } from '../business/Policy';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

export const rentalRoutes = Router();

rentalRoutes.get('/policy/latest', async (req, res) => {
  try {
    const dormId = req.query.dormId as string;
    const policy = await Policy.getLatestRegulations(dormId);
    res.json({ message: 'Success', status: 200, data: policy });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Cannot load policy', status: 500, data: null });
  }
});

rentalRoutes.post('/policy/confirm', async (req, res) => {
  try {
    const payload: PolicyAgreementRequestDTO = req.body;
    const result = await Policy.confirmAgreement(payload.customerId);
    res.json({ message: 'Xác nhận quy định thành công', status: 200, data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Cannot confirm policy', status: 400, data: null });
  }
});

rentalRoutes.get('/conditions', (req, res) => {
  const conditions = Rental.getConditions();
  res.json({ message: 'Success', status: 200, data: conditions });
});

rentalRoutes.post('/eligibility-check', async (req, res) => {
  try {
    const payload: RentalEligibilityRequestDTO = req.body;
    const result = await Rental.checkEligibility(payload);
    res.json({ message: 'Success', status: 200, data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Eligibility check failed', status: 400, data: null });
  }
});

rentalRoutes.post('/register', async (req, res) => {
  try {
    const payload: RentalRegistrationRequestDTO = req.body;
    const result = await Rental.register(payload);
    res.status(201).json({ message: 'Đăng ký thuê thành công', status: 201, data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Register failed', status: 400, data: null });
  }
});

rentalRoutes.post('/payment-preview', async (req, res) => {
  try {
    const payload: PaymentPreviewRequestDTO = req.body;
    const result = await Rental.previewPayment(payload);
    res.json({ message: 'Success', status: 200, data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Preview failed', status: 400, data: null });
  }
});

rentalRoutes.get('/orders/my', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: 'Unauthorized' });

    const orders = await Rental.getOrdersByUser(email);
    res.json({ message: 'Success', status: 200, data: orders });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch orders', status: 500, data: [] });
  }
});

rentalRoutes.get('/orders/all', authMiddleware, async (req, res) => {
  try {
    const orders = await Rental.getAllOrders();
    res.json({ message: 'Success', status: 200, data: orders });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch all orders', status: 500, data: [] });
  }
});
