import { Router, Request, Response } from 'express';
import { CheckoutRequest } from '../business/CheckoutRequest';
import { CheckoutRequestDB } from '../database/CheckoutRequestDB';
import { Contract } from '../business/Contract';
import { ContractDB } from '../database/ContractDB';
import { Room } from '../business/Room';
import { RefundCalculation } from '../business/RefundCalculation';
import { CheckoutStatus } from '@dormarch/shared';

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
    const { userCCCD, contractId, expectedDate, documentUrl } = req.body;

    if (!userCCCD || !contractId || !expectedDate) {
      res.status(400).json({ message: 'userCCCD, contractId và expectedDate là bắt buộc.' });
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

    if (contract.userCCCD !== userCCCD) {
      res.status(400).json({ message: 'Hợp đồng không thuộc về khách hàng này.' });
      return;
    }

    const existingRequests = await CheckoutRequest.getList();
    const activeRequest = existingRequests.find(r =>
      r.contractId === contractId &&
      r.userCCCD === userCCCD &&
      [CheckoutStatus.PENDING, CheckoutStatus.PROCESSING, CheckoutStatus.PENDING_LIQUIDATION].includes(r.status)
    );

    if (activeRequest) {
      res.status(400).json({ message: 'Đã có yêu cầu trả phòng đang xử lý cho hợp đồng này.' });
      return;
    }

    const newRequest = await CheckoutRequest.create({ userCCCD, contractId, expectedDate, documentUrl });
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

checkoutRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const success = await CheckoutRequest.updateStatus(req.params.id, status as CheckoutStatus);
    
    if (!success) {
      res.status(404).json({ message: 'Không tìm thấy yêu cầu để cập nhật' });
      return;
    }

    const updated = await CheckoutRequest.getById(req.params.id);
    res.status(200).json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = message.includes('Không thể chuyển trạng thái') ? 400 : 500;
    res.status(statusCode).json({ message });
  }
});

checkoutRouter.patch('/:id/complete-liquidation', async (req: Request, res: Response) => {
  try {
    const { checkoutDocumentUrl, liquidationDocumentUrl, status } = req.body;

    if (!checkoutDocumentUrl || !liquidationDocumentUrl) {
      res.status(400).json({ message: 'checkoutDocumentUrl và liquidationDocumentUrl là bắt buộc.' });
      return;
    }

    const request = await CheckoutRequest.getById(req.params.id);
    if (!request) {
      res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      return;
    }

    await CheckoutRequestDB.updateDocuments(req.params.id, checkoutDocumentUrl);

    if (request.contractId) {
      await ContractDB.updateLiquidationUrl(request.contractId, liquidationDocumentUrl);
      await ContractDB.updateStatus(request.contractId, 'LIQUIDATED');
      const contract = await Contract.getByContractId(request.contractId);
      if (contract?.roomId) {
        await Room.updateStatus(contract.roomId, 'AVAILABLE');
      }
    }

    await CheckoutRequest.updateStatus(req.params.id, status || CheckoutStatus.LIQUIDATED);

    const finalRequest = await CheckoutRequest.getById(req.params.id);
    res.status(200).json(finalRequest);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = message.includes('Không thể chuyển trạng thái') ? 400 : 500;
    res.status(statusCode).json({ message });
  }
});
