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
import { RentalDB } from '../database/RentalDB';
import { Policy } from './Policy';

export class Rental {
  static getConditions(): RentalConditionDTO[] {
    return [
      {
        id: 'legal',
        title: 'Điều kiện pháp lý',
        description: 'Người thuê cần cung cấp CCCD hợp lệ và thông tin chính xác.',
        required: true
      },
      {
        id: 'rule',
        title: 'Nội quy ký túc xá',
        description: 'Người thuê cam kết tuân thủ nội quy trong suốt thời gian thuê.',
        required: true
      },
      {
        id: 'payment',
        title: 'Cam kết thanh toán',
        description: 'Người thuê thanh toán đúng hạn theo quy định.',
        required: true
      }
    ];
  }

  static async checkEligibility(payload: RentalEligibilityRequestDTO): Promise<RentalEligibilityDTO> {
    const reasons: string[] = [];

    if (!payload.roomId || !payload.bedIds || payload.bedIds.length === 0) {
      reasons.push('Thiếu thông tin phòng hoặc danh sách giường.');
    }

    if (!/^\d{9,12}$/.test(payload.idCard)) {
      reasons.push('CCCD không hợp lệ.');
    }

    const alreadyDeposited = await RentalDB.hasDeposit(
      payload.roomId,
      payload.idCard,
      payload.bedIds
    );

    if (payload.roomId && payload.bedIds && payload.bedIds.length > 0) {
      const bedsAvailable = await RentalDB.areBedsAvailable(payload.roomId, payload.bedIds);
      if (!bedsAvailable) {
        reasons.push('Một hoặc nhiều giường đã được giữ chỗ hoặc không khả dụng.');
      }
    }

    return {
      eligible: reasons.length === 0,
      reasons,
      alreadyDeposited,
      lockBedSelection: alreadyDeposited
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
    const registrationId = `REG-${Date.now()}`;

    await RentalDB.createRegistration({
      ...payload,
      registrationId,
      roomPrice,
      alreadyDeposited: eligibility.alreadyDeposited
    });

    const summary: SummaryItemDTO[] = [
      { label: 'Tiền phòng tháng đầu', amount: roomPrice }
    ];

    return {
      registrationId,
      roomId: payload.roomId,
      bedIds: payload.bedIds,
      roomPrice,
      alreadyDeposited: eligibility.alreadyDeposited,
      summary
    };
  }

  static async previewPayment(payload: PaymentPreviewRequestDTO): Promise<PaymentPreviewDTO> {
    const registration = await RentalDB.getRegistration(payload.registrationId);
    if (!registration) {
      throw new Error('Không tìm thấy thông tin đăng ký thuê.');
    }

    // Deposit policy: 2 months of rent for selected beds.
    const depositAmount = registration.roomPrice * 2;

    if (payload.action === 'DEPOSIT') {
      const items: SummaryItemDTO[] = [
        { label: 'Tiền đặt cọc (2 tháng)', amount: depositAmount }
      ];

      return {
        registrationId: payload.registrationId,
        action: payload.action,
        items,
        totalAmount: depositAmount
      };
    }

    const rentalMonths = Math.max(1, Number(registration.rentalMonths || 1));
    const fullRentalAmount = registration.roomPrice * rentalMonths;

    const items: SummaryItemDTO[] = [
      { label: `Tiền phòng (${rentalMonths} tháng)`, amount: fullRentalAmount }
    ];

    if (registration.alreadyDeposited) {
      items.push({ label: 'Đã trừ tiền cọc', amount: -depositAmount });
    }

    const totalAmount = fullRentalAmount - (registration.alreadyDeposited
      ? depositAmount
      : 0);

    return {
      registrationId: payload.registrationId,
      action: payload.action,
      items,
      totalAmount
    };
  }
}
