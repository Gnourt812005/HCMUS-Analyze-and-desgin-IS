import { Router, Request, Response } from 'express';
import { RefundCalculation } from '../business/RefundCalculation';

export const refundRouter = Router();

refundRouter.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { rentalFormId, depositAmount } = req.body;

    if (!rentalFormId || depositAmount === undefined) {
      res.status(400).json({ message: 'rentalFormId và depositAmount là bắt buộc' });
      return;
    }

    const result = await RefundCalculation.calculateRefundAmount(
      '',
      rentalFormId,
      depositAmount
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tính toán hoàn cọc', error: error instanceof Error ? error.message : error });
  }
});

refundRouter.get('/by-request/:requestId', async (req: Request, res: Response) => {
  try {
    const refund = await RefundCalculation.getByRequestId(req.params.requestId);
    if (!refund) {
      res.status(404).json({ message: 'Không tìm thấy bảng tính hoàn cọc' });
      return;
    }
    res.status(200).json(refund);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

refundRouter.get('/:calculationId', async (req: Request, res: Response) => {
  try {
    const refund = await RefundCalculation.getById(req.params.calculationId);
    if (!refund) {
      res.status(404).json({ message: 'Không tìm thấy bảng tính hoàn cọc' });
      return;
    }
    res.status(200).json(refund);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

refundRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { requestId, rentalFormId, depositAmount, damageFee, extraDebt, extraFee, finalRefundAmount, notes } = req.body;

    if (!requestId || depositAmount === undefined || damageFee === undefined) {
      res.status(400).json({ message: 'requestId, depositAmount, và damageFee là bắt buộc' });
      return;
    }

    const newCalculation = await RefundCalculation.create({
      requestId,
      rentalFormId,
      depositAmount,
      damageFee,
      extraFee: extraFee !== undefined ? extraFee : extraDebt || 0,
      finalRefundAmount,
      notes
    });

    res.status(201).json(newCalculation);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

refundRouter.put('/:calculationId', async (req: Request, res: Response) => {
  try {
    const { depositAmount, damageFee, extraDebt, extraFee, finalRefundAmount, notes } = req.body;

    const updated = await RefundCalculation.update(req.params.calculationId, {
      depositAmount,
      damageFee,
      extraFee: extraFee !== undefined ? extraFee : extraDebt || 0,
      finalRefundAmount,
      notes
    });

    if (!updated) {
      res.status(404).json({ message: 'Không tìm thấy bảng tính hoàn cọc để cập nhật' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});
