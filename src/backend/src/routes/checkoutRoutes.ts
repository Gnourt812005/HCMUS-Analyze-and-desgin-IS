import { Router, Request, Response } from 'express';
import { CheckoutRequest } from '../business/CheckoutRequest';
import { Contract } from '../business/Contract';
import { Room } from '../business/Room';
import { Rental } from '../business/Rental';
import { RefundCalculation } from '../business/RefundCalculation';
import { RefundDB } from '../database/RefundDB';
import { CheckoutStatus, ContractStatus, RefundCalculationDTO } from '@dormarch/shared';
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

checkoutRouter.get('/rental-forms/available', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = (req.query.userEmail as string) || req.user?.email;
    const authEmail = req.user?.email;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!userEmail || !authEmail) {
      return res.status(401).json({ message: 'Không thể định danh' });
    }

    // Only allow admin to fetch for other users, or users to fetch their own
    if (userEmail !== authEmail && !isAdmin) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    // Get active rental forms without active checkout requests
    const rentalForms = await RefundDB.getActiveRentalFormsForCheckout(userEmail);
    res.status(200).json(rentalForms);
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

    // Fetch rental form data and refund calculation
    const rentalForm = request.rentalFormId ? await RefundDB.getRentalFormById(request.rentalFormId) : null;
    const refund = await RefundCalculation.getByRequestId(request.requestId);

    const depositAmount = rentalForm?.totalAmount || 0;

    res.status(200).json({ request, rentalForm, refund, depositAmount });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

checkoutRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { userEmail, rentalFormId, expectedDate} = req.body;

    if (!userEmail || !rentalFormId || !expectedDate) {
      res.status(400).json({ message: 'userEmail, rentalFormId và expectedDate là bắt buộc.' });
      return;
    }

    const rentalForm = await RefundDB.getRentalFormById(rentalFormId);
    if (!rentalForm) {
      res.status(400).json({ message: 'Không tìm thấy phiếu đăng ký thuê.' });
      return;
    }

    if (rentalForm.userEmail !== userEmail) {
      res.status(400).json({ message: 'Phiếu đăng ký thuê không thuộc về khách hàng này.' });
      return;
    }

    // Use atomic insert-with-check to prevent race condition with concurrent requests
    const createResult = await CheckoutRequest.createWithDuplicateCheck({
      userEmail,
      rentalFormId,
      expectedDate
    });

    if (!createResult.success) {
      res.status(400).json({ message: createResult.error || 'Không thể tạo yêu cầu' });
      return;
    }

    // Send success response after creation
    if (!res.headersSent) {
      res.status(201).json(createResult.request);
    }

  } catch (error) {
    console.error('Error in checkoutRouter.post:', error); // Log the error for debugging
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error', error });
    }
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
    
    // Auto-calculate refund if no contract exists and status is transitioning to PROCESSING
    if (newStatus === CheckoutStatus.PROCESSING && updated && updated.rentalFormId) {
      try {
        const contract = await Contract.getByRentalFormId(updated.rentalFormId);
        if (!contract) {
          await RefundCalculation.autoCalculateRefundForNoContract(requestId, updated.rentalFormId);
        }
      } catch (autoCalcError) {
        console.error('Error auto-calculating refund:', autoCalcError);
      }
    }

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

    // Find and update the associated contract if it exists
    if (request.rentalFormId) {
      const contract = await Contract.getByRentalFormId(request.rentalFormId);
      if (contract && contract.contractId) {
        await Contract.updateStatus(contract.contractId, ContractStatus.LIQUIDATED);
        const bedsInfo = await Contract.getBedsInfoByContractId(contract.contractId);
        if (bedsInfo && bedsInfo.roomId && bedsInfo.bedIds.length > 0) {
          await Room.updateBedStatus(bedsInfo.roomId, bedsInfo.bedIds, 'AVAILABLE');
        }
      } else {
        // No contract - get beds info directly from rental form
        const rentalFormBedsInfo = await Rental.getBedsInfoByRentalFormId(request.rentalFormId);
        if (rentalFormBedsInfo && rentalFormBedsInfo.roomId && rentalFormBedsInfo.bedIds.length > 0) {
          await Room.updateBedStatus(rentalFormBedsInfo.roomId, rentalFormBedsInfo.bedIds, 'AVAILABLE');
        }
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
