import {
  ConfirmPaymentDTO,
  ConfirmPaymentRequestDTO,
  CreatePaymentCodeRequestDTO,
  FinalizePaymentRequestDTO,
  PaymentSessionDTO,
  RetryPaymentRequestDTO,
  VerifyPaymentRequestDTO
} from '@dormarch/shared';
import { PaymentDB } from '../database/PaymentDB';
import { RentalDB } from '../database/RentalDB';
import { RoomDB } from '../database/RoomDB';
import { Rental } from './Rental';

export class Payment {
  static async createPaymentCode(payload: CreatePaymentCodeRequestDTO): Promise<PaymentSessionDTO> {
    const registration = await RentalDB.getRegistration(payload.registrationId);
    if (!registration) {
      throw new Error('Không tìm thấy hồ sơ đăng ký thuê.');
    }

    return PaymentDB.createSession(payload.registrationId, payload.action, payload.method);
  }

  static async verifyTransaction(payload: VerifyPaymentRequestDTO): Promise<PaymentSessionDTO> {
    const session = await PaymentDB.getSession(payload.sessionId);
    if (!session) {
      throw new Error('Không tìm thấy phiên thanh toán.');
    }

    if (session.status === 'COMPLETED') {
      throw new Error('Phiên thanh toán đã hoàn tất.');
    }

    if (session.status !== 'QR_READY') {
      throw new Error('Phiên thanh toán hiện không ở trạng thái chờ quét QR.');
    }

    await PaymentDB.updateSessionStatus(payload.sessionId, 'VERIFYING');

    if (payload.outcome === 'timeout') {
      return PaymentDB.updateSessionStatus(
        payload.sessionId,
        'TIMEOUT',
        'Hết thời gian chờ phản hồi từ ngân hàng.'
      );
    }

    if (payload.outcome === 'cancel') {
      return PaymentDB.updateSessionStatus(
        payload.sessionId,
        'FAILED',
        'Khách hàng đã hủy hoặc không quét mã.'
      );
    }

    return PaymentDB.updateSessionStatus(payload.sessionId, 'SUCCESS', 'Xác minh giao dịch thành công.');
  }

  static async getPaymentStatus(sessionId: string): Promise<PaymentSessionDTO> {
    const session = await PaymentDB.getSession(sessionId);
    if (!session) {
      throw new Error('Không tìm thấy phiên thanh toán.');
    }
    return session;
  }

  static async retryPayment(payload: RetryPaymentRequestDTO): Promise<PaymentSessionDTO> {
    const session = await PaymentDB.getSession(payload.sessionId);
    if (!session) {
      throw new Error('Không tìm thấy phiên thanh toán.');
    }

    if (session.status !== 'TIMEOUT' && session.status !== 'FAILED') {
      throw new Error('Chỉ có thể thử lại khi thanh toán timeout hoặc thất bại.');
    }

    return PaymentDB.regenerateSession(payload.sessionId);
  }

  static async finalizePayment(payload: FinalizePaymentRequestDTO): Promise<PaymentSessionDTO> {
    const session = await PaymentDB.getSession(payload.sessionId);
    if (!session) {
      throw new Error('Không tìm thấy phiên thanh toán.');
    }

    if (session.status === 'COMPLETED') {
      return session;
    }

    if (session.status !== 'SUCCESS') {
      throw new Error('Phiên thanh toán chưa xác minh thành công để chốt hóa đơn.');
    }

    const registration = await RentalDB.getRegistration(session.registrationId);
    if (!registration) {
      throw new Error('Không tìm thấy hồ sơ đăng ký thuê.');
    }

    const preview = await Rental.previewPayment({
      registrationId: session.registrationId,
      action: session.action
    });

    if (session.action === 'DEPOSIT') {
      const invoiceId = await PaymentDB.createInvoice(session.registrationId, preview.totalAmount, session.action);
      await PaymentDB.attachInvoice(payload.sessionId, invoiceId);

      await RentalDB.markDeposited(
        session.registrationId,
        registration.roomId,
        registration.bedIds
      );
      await RoomDB.markBedsStatus(registration.roomId, registration.bedIds, 'DEPOSITED');
    }

    if (session.action === 'FULL_PAYMENT') {
      const depositPart = registration.alreadyDeposited ? 0 : registration.roomPrice * 2;
      const rentPart = registration.roomPrice;

      // 1. If there's a deposit part, create an invoice for it
      if (depositPart > 0) {
        await PaymentDB.createInvoice(session.registrationId, depositPart, 'DEPOSIT');
        await RentalDB.markDeposited(session.registrationId, registration.roomId, registration.bedIds);
      }

      // 2. Create the FULL record and its payment
      await RentalDB.markFullyPaid(
        session.registrationId,
        registration.email || registration.customerName,
        rentPart,
        registration.bedIds
      );
      
      await RentalDB.markBooked(registration.roomId, registration.bedIds);
      await RoomDB.markBedsStatus(registration.roomId, registration.bedIds, 'BOOKED');

      // Attach a dummy invoice ID to session to satisfy the flow
      await PaymentDB.attachInvoice(payload.sessionId, 'FULL-' + session.registrationId);
    }

    return PaymentDB.updateSessionStatus(payload.sessionId, 'COMPLETED', 'Thanh toán thành công, đã tạo hóa đơn điện tử.');
  }

  static async confirm(payload: ConfirmPaymentRequestDTO): Promise<ConfirmPaymentDTO> {
    const registration = await RentalDB.getRegistration(payload.registrationId);
    if (!registration) {
      throw new Error('Không tìm thấy hồ sơ đăng ký thuê.');
    }

    const preview = await Rental.previewPayment({
      registrationId: payload.registrationId,
      action: payload.action
    });

    let invoiceId = 'SIM-INV-' + Date.now();

    if (payload.action === 'DEPOSIT') {
      invoiceId = await PaymentDB.createInvoice(payload.registrationId, preview.totalAmount, payload.action);
      await RentalDB.markDeposited(
        payload.registrationId,
        registration.roomId,
        registration.bedIds
      );
      await RoomDB.markBedsStatus(registration.roomId, registration.bedIds, 'DEPOSITED');
    }

    if (payload.action === 'FULL_PAYMENT') {
      const depositPart = registration.alreadyDeposited ? 0 : registration.roomPrice * 2;
      const rentPart = registration.roomPrice;

      if (depositPart > 0) {
        invoiceId = await PaymentDB.createInvoice(payload.registrationId, depositPart, 'DEPOSIT');
        await RentalDB.markDeposited(payload.registrationId, registration.roomId, registration.bedIds);
      }

      await RentalDB.markFullyPaid(
        payload.registrationId,
        registration.email || registration.customerName,
        rentPart,
        registration.bedIds
      );
      await RentalDB.markBooked(registration.roomId, registration.bedIds);
      await RoomDB.markBedsStatus(registration.roomId, registration.bedIds, 'BOOKED');
      
      if (depositPart === 0) {
        invoiceId = 'FULL-INV-' + payload.registrationId;
      }
    }

    return {
      success: true,
      invoiceId
    };
  }
}
