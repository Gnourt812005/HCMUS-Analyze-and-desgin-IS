import { Router, Request, Response } from 'express';
import { CheckoutRequest } from '../business/CheckoutRequest';
import { Contract } from '../business/Contract';
import { Room } from '../business/Room';
import { RefundCalculation } from '../business/RefundCalculation';
import { CheckoutStatus, ContractStatus } from '@dormarch/shared';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

export const checkoutRouter = Router();

checkoutRouter.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({ message: 'Không thể định danh' });
    }
    
    // Admin sees all requests, customers see only their own
    const isAdmin = req.user?.role === 'ADMIN';
    const requests = isAdmin 
      ? await CheckoutRequest.getList()
      : await CheckoutRequest.getListByUserEmail(email);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

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

checkoutRouter.get('/:id/details', async (req: Request, res: Response) => {
  try {
    const request = await CheckoutRequest.getById(req.params.id);
    if (!request) {
      res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      return;
    }

    const contract = request.contractId ? await Contract.getByContractId(request.contractId) : null;
    const refund = await RefundCalculation.getByRequestId(request.requestId);

    const depositAmount = contract?.depositAmount || 0;

    res.status(200).json({ request, contract, refund, depositAmount });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

checkoutRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { userEmail, contractId, expectedDate} = req.body;

    if (!userEmail || !contractId || !expectedDate) {
      res.status(400).json({ message: 'userEmail, contractId và expectedDate là bắt buộc.' });
      return;
    }

    const contract = await Contract.getByContractId(contractId);
    if (!contract) {
      res.status(400).json({ message: 'Không tìm thấy hợp đồng.' });
      return;
    }

    if (contract.status !== ContractStatus.ACTIVE) {
      res.status(400).json({ message: 'Hợp đồng không còn hiệu lực. Không thể tạo yêu cầu trả phòng.' });
      return;
    }

    if (contract.userEmail !== userEmail) {
      res.status(400).json({ message: 'Hợp đồng không thuộc về khách hàng này.' });
      return;
    }

    // Use atomic insert-with-check to prevent race condition with concurrent requests
    const createResult = await CheckoutRequest.createWithDuplicateCheck({
      userEmail,
      contractId,
      expectedDate
    });

    if (!createResult.success) {
      res.status(400).json({ message: createResult.error || 'Không thể tạo yêu cầu' });
      return;
    }

    res.status(201).json(createResult.request);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

checkoutRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, expectedStatus } = req.body;
    const requestId = req.params.id;
    const newStatus = status as CheckoutStatus;
    const expectedCurrentStatus = expectedStatus as CheckoutStatus | undefined;

    const currentRequest = await CheckoutRequest.getById(requestId);
    if (!currentRequest) {
      res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      return;
    }

    const success = await CheckoutRequest.updateStatus(requestId, newStatus, expectedCurrentStatus);
    if (!success) {
      throw new Error('Yêu cầu đã được cập nhật bởi quản trị viên khác. Vui lòng làm mới và thử lại.');
    }

    const updated = await CheckoutRequest.getById(requestId);
    res.status(200).json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = message.includes('Yêu cầu đã được cập nhật bởi quản trị viên khác')
      ? 409
      : message.includes('Không thể chuyển trạng thái')
      ? 400
      : 500;
    res.status(statusCode).json({ message });
  }
});

checkoutRouter.patch('/:id/complete-liquidation', async (req: Request, res: Response) => {
  try {
    const { status, expectedStatus } = req.body;

    const request = await CheckoutRequest.getById(req.params.id);
    if (!request) {
      res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      return;
    }

    const targetStatus = (status as CheckoutStatus) || CheckoutStatus.LIQUIDATED;
    const success = await CheckoutRequest.updateStatus(req.params.id, targetStatus, expectedStatus as CheckoutStatus | undefined);
    if (!success) {
      throw new Error('Yêu cầu đã được cập nhật bởi quản trị viên khác. Vui lòng làm mới và thử lại.');
    }

    if (request.contractId) {
      await Contract.updateStatus(request.contractId, ContractStatus.LIQUIDATED);
      const bedsInfo = await Contract.getBedsInfoByContractId(request.contractId);
      if (bedsInfo && bedsInfo.roomId && bedsInfo.bedIds.length > 0) {
        await Room.updateBedStatus(bedsInfo.roomId, bedsInfo.bedIds, 'AVAILABLE');
      }
    }

    const finalRequest = await CheckoutRequest.getById(req.params.id);
    res.status(200).json(finalRequest);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = message.includes('Yêu cầu đã được cập nhật bởi quản trị viên khác')
      ? 409
      : message.includes('Không thể chuyển trạng thái')
      ? 400
      : 500;
    res.status(statusCode).json({ message });
  }
});
