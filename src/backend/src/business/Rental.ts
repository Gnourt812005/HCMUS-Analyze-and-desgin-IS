import {
  PaymentPreviewDTO,
  PaymentPreviewRequestDTO,
  RentalConditionDTO,
  RentalEligibilityDTO,
  RentalEligibilityRequestDTO,
  RentalRegistrationDTO,
  RentalRegistrationRequestDTO,
  SummaryItemDTO
} from '@dormarch/shared';
import { randomUUID } from 'crypto';
import { RentalDB } from '../database/RentalDB';
import { OrderDB } from '../database/OrderDB';
import { Policy } from './Policy';

export class Rental {
  static getConditions(): RentalConditionDTO[] {
    return [];
  }

  static async checkEligibility(payload: RentalEligibilityRequestDTO): Promise<RentalEligibilityDTO> {
    const reasons: string[] = [];

    if (!payload.roomId || !payload.bedIds || payload.bedIds.length === 0) {
      reasons.push('Thiếu thông tin phòng hoặc danh sách giường.');
    }

    if (!/^\d{9,12}$/.test(payload.idCard)) {
      reasons.push('CCCD không hợp lệ.');
    }

    const { alreadyDeposited, registrationId } = await RentalDB.hasDeposit(
      payload.roomId,
      payload.idCard,
      payload.bedIds
    );

    console.log(`[EligibilityCheck] Room: ${payload.roomId}, ID: ${payload.idCard}, FoundDeposit: ${alreadyDeposited}, ID: ${registrationId}`);

    if (payload.roomId && payload.bedIds && payload.bedIds.length > 0) {
      const bedsAvailable = await RentalDB.areBedsAvailable(payload.roomId, payload.bedIds);
      if (!bedsAvailable && !alreadyDeposited) {
        reasons.push('Một hoặc nhiều giường đã được giữ chỗ hoặc không khả dụng.');
      }
    }

    return {
      eligible: reasons.length === 0,
      reasons,
      alreadyDeposited,
      lockBedSelection: alreadyDeposited,
      existingRegistrationId: registrationId
    };
  }

  static async register(payload: RentalRegistrationRequestDTO): Promise<RentalRegistrationDTO> {
    if (!payload.acceptedConditions) {
      throw new Error('Bạn cần đồng ý điều kiện thuê trước khi đăng ký.');
    }

    const hasConfirmedPolicy = await Policy.hasConfirmed(payload.idCard);
    if (!hasConfirmedPolicy) {
      throw new Error('Bạn chưa xác nhận đồng ý quy định thuê phòng.');
    }

    if (!payload.customerName || !payload.phone || !payload.email || !payload.idCard) {
      throw new Error('Thông tin khách hàng chưa đầy đủ.');
    }

    const eligibility = await this.checkEligibility({
      roomId: payload.roomId,
      bedIds: payload.bedIds,
      idCard: payload.idCard
    });

    if (!eligibility.eligible) {
      throw new Error(eligibility.reasons.join(' '));
    }

    const roomPrice = await RentalDB.getBedsTotalPrice(payload.roomId, payload.bedIds);
    const registrationId = randomUUID();

    await RentalDB.createRegistration({
      ...payload,
      registrationId,
      roomPrice,
      alreadyDeposited: eligibility.alreadyDeposited
    }, payload.action);

    // Get preview immediately after registration
    const preview = await this.previewPayment({
      registrationId,
      action: payload.action
    });

    return {
      registrationId,
      roomId: payload.roomId,
      bedIds: payload.bedIds,
      roomPrice,
      alreadyDeposited: eligibility.alreadyDeposited,
      summary: preview.items
    };
  }

  static async previewPayment(payload: PaymentPreviewRequestDTO): Promise<PaymentPreviewDTO> {
    const registration = await RentalDB.getRegistration(payload.registrationId);
    if (!registration) {
      throw new Error('Không tìm thấy thông tin đăng ký thuê.');
    }

    const depositAmount = registration.roomPrice * 2;
    const items: SummaryItemDTO[] = [];

    if (payload.action === 'DEPOSIT') {
      items.push({ label: 'Tiền đặt cọc (2 tháng)', amount: depositAmount });
      return {
        registrationId: payload.registrationId,
        action: payload.action,
        items,
        totalAmount: depositAmount
      };
    }

    // FULL_PAYMENT logic
    const rentAmount = registration.roomPrice; // Default 1 month

    if (registration.alreadyDeposited) {
      // If already deposited, just pay the first month rent
      items.push({ label: 'Tiền thuê tháng đầu', amount: rentAmount });
    } else {
      // If not deposited, pay both deposit and first month rent
      items.push({ label: 'Tiền đặt cọc (2 tháng)', amount: depositAmount });
      items.push({ label: 'Tiền thuê tháng đầu', amount: rentAmount });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    return {
      registrationId: payload.registrationId,
      action: payload.action,
      items,
      totalAmount
    };
  }

  static async getOrdersByUser(email: string) {
    return OrderDB.getOrdersByUser(email);
  }

  static async getAllOrders() {
    return OrderDB.getAllOrders();
  }
}
