import { Router, Request, Response } from 'express';
import { CheckoutRequest } from '../business/CheckoutRequest';
import { Contract } from '../business/Contract';
import { RefundCalculation } from '../business/RefundCalculation';
import { CheckoutStatus } from '@dormarch/shared';

export const checkoutRouter = Router();

// Kịch bản 1: Xem danh sách yêu cầu trả phòng
checkoutRouter.get('/', async (req: Request, res: Response) => {
  try {
    const requests = await CheckoutRequest.getList();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Lấy chi tiết một yêu cầu cụ thể
checkoutRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const request = await CheckoutRequest.getById(req.params.id);
    if (!request) {
      res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      return;
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Lấy chi tiết mở rộng bao gồm hợp đồng và bảng tính hoàn trả
checkoutRouter.get('/:id/details', async (req: Request, res: Response) => {
  try {
    const request = await CheckoutRequest.getById(req.params.id);
    if (!request) {
      res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      return;
    }

    const contract = request.contractId ? await Contract.getByContractId(request.contractId) : null;
    const refund = await RefundCalculation.getByRequestId(request.requestId);

    res.status(200).json({ request, contract, refund });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Kịch bản 2: Tạo yêu cầu trả phòng mới
checkoutRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { customerId, contractId, expectedDate, documentUrl } = req.body;

    if (!customerId || !contractId || !expectedDate) {
      res.status(400).json({ message: 'customerId, contractId và expectedDate là bắt buộc.' });
      return;
    }

    const newRequest = await CheckoutRequest.create({ customerId, contractId, expectedDate, documentUrl });
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Kịch bản 3 & 4: Cập nhật trạng thái (Tiếp nhận / Hủy / Từ chối)
checkoutRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const success = await CheckoutRequest.updateStatus(req.params.id, status as CheckoutStatus);
    
    if (!success) {
      res.status(404).json({ message: 'Không tìm thấy yêu cầu để cập nhật' });
      return;
    }

    // Return updated request object
    const updated = await CheckoutRequest.getById(req.params.id);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});
