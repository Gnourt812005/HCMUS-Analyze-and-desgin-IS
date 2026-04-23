import { Router, Request, Response } from 'express';
import { CheckoutRequest } from '../business/CheckoutRequest';
import { CheckoutRequestDB } from '../database/CheckoutRequestDB';
import { Contract } from '../business/Contract';
import { ContractDB } from '../database/ContractDB';
import { Room } from '../business/Room';
import { RefundCalculation } from '../business/RefundCalculation';
import { CheckoutStatus, ContractStatus } from '@dormarch/shared';

export const checkoutRouter = Router();

checkoutRouter.get('/', async (req: Request, res: Response) => {
  try {
    const requests = await CheckoutRequest.getList();
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

    res.status(200).json({ request, contract, refund });
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

    if (contract.status !== 'ACTIVE') {
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

    // Update associated contract status to PENDING_CHECKOUT only after successful request creation
    if (contractId && createResult.request) {
      await ContractDB.updateStatus(contractId, ContractStatus.PENDING_CHECKOUT);
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

    if (currentRequest.contractId) {
      // If the checkout request is cancelled or rejected, revert contract status to ACTIVE
      if ([CheckoutStatus.CANCELLED, CheckoutStatus.REJECTED].includes(newStatus)) {
        await ContractDB.updateStatus(currentRequest.contractId, ContractStatus.ACTIVE);
      }
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
      await ContractDB.updateStatus(request.contractId, ContractStatus.LIQUIDATED);
      const contract = await Contract.getByContractId(request.contractId);
      // if (contract?.roomId) {
      //   await Room.updateStatus(contract.roomId, RoomStatus.AVAILABLE);
      // }
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
