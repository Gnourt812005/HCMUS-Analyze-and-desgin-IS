import { Router } from 'express';
import {
  PaymentPreviewRequestDTO,
  PolicyAgreementRequestDTO,
  RentalEligibilityRequestDTO,
  RentalRegistrationRequestDTO
} from '@dormarch/shared';
import { Rental } from '../../business/Rental';
import { Policy } from '../../business/Policy';
import { AuthRequest } from '../../middleware/authMiddleware';

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

// ─── Order management routes ──────────────────────────────────

rentalRoutes.get('/orders/all', async (req, res) => {
  try {
    const orders = await Rental.getAllOrders();
    res.json({ message: 'Success', status: 200, data: orders });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch all orders', status: 500, data: [] });
  }
});
