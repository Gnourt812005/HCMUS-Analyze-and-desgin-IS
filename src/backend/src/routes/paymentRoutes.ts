import { Router } from 'express';
import {
  ConfirmPaymentRequestDTO,
  CreatePaymentCodeRequestDTO,
  FinalizePaymentRequestDTO,
  RetryPaymentRequestDTO,
  VerifyPaymentRequestDTO
} from '@dormarch/shared';
import { Payment } from '../business/Payment';

export const paymentRoutes = Router();

paymentRoutes.post('/create-code', async (req, res) => {
  try {
    const payload: CreatePaymentCodeRequestDTO = req.body;
    const result = await Payment.createPaymentCode(payload);
    res.json({ message: 'Tạo mã thanh toán thành công', status: 200, data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Cannot create payment code', status: 400, data: null });
  }
});

paymentRoutes.post('/verify', async (req, res) => {
  try {
    const payload: VerifyPaymentRequestDTO = req.body;
    const result = await Payment.verifyTransaction(payload);
    res.json({ message: 'Xử lý xác minh thanh toán thành công', status: 200, data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Cannot verify payment', status: 400, data: null });
  }
});

paymentRoutes.get('/:sessionId/status', async (req, res) => {
  try {
    const result = await Payment.getPaymentStatus(req.params.sessionId);
    res.json({ message: 'Success', status: 200, data: result });
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Cannot get payment status', status: 404, data: null });
  }
});

paymentRoutes.post('/retry', async (req, res) => {
  try {
    const payload: RetryPaymentRequestDTO = req.body;
    const result = await Payment.retryPayment(payload);
    res.json({ message: 'Đã tạo lại phiên thanh toán', status: 200, data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Cannot retry payment', status: 400, data: null });
  }
});

paymentRoutes.post('/finalize', async (req, res) => {
  try {
    const payload: FinalizePaymentRequestDTO = req.body;
    const result = await Payment.finalizePayment(payload);
    res.json({ message: 'Hoàn tất thanh toán thành công', status: 200, data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Cannot finalize payment', status: 400, data: null });
  }
});

paymentRoutes.post('/confirm', async (req, res) => {
  try {
    const payload: ConfirmPaymentRequestDTO = req.body;
    const result = await Payment.confirm(payload);
    res.json({ message: 'Thanh toán thành công', status: 200, data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Payment failed', status: 400, data: null });
  }
});
