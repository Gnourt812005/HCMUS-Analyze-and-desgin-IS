import { RefundDB } from '../database/RefundDB';
import { RefundCalculationDTO } from '@dormarch/shared';
import { Rental } from './Rental';
import { Contract } from './Contract';

export class RefundCalculation {
  calculationId: string;
  requestId: string;
  rentalFormId?: string;
  depositAmount: number;
  damageFee: number;
  extraFee: number;
  finalRefundAmount: number;
  notes?: string;
  createdAt: string;

  constructor(data: Partial<RefundCalculation>) {
    this.calculationId = data.calculationId || '';
    this.requestId = data.requestId || '';
    this.rentalFormId = data.rentalFormId;
    this.depositAmount = data.depositAmount || 0;
    this.damageFee = data.damageFee || 0;
    this.extraFee = data.extraFee || 0;
    this.finalRefundAmount = data.finalRefundAmount || 0;
    this.notes = data.notes;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toDto(): RefundCalculationDTO {
    return {
      calculationId: this.calculationId,
      requestId: this.requestId,
      rentalFormId: this.rentalFormId,
      depositAmount: this.depositAmount,
      damageFee: this.damageFee,
      extraFee: this.extraFee,
      finalRefundAmount: this.finalRefundAmount,
      notes: this.notes,
      createdAt: this.createdAt
    };
  }

  static async getByRequestId(requestId: string): Promise<RefundCalculationDTO | null> {
    const refund = await RefundDB.getByRequestId(requestId);
    return refund ? new RefundCalculation(refund).toDto() : null;
  }

  static async getById(calculationId: string): Promise<RefundCalculationDTO | null> {
    const refund = await RefundDB.getById(calculationId);
    return refund ? new RefundCalculation(refund).toDto() : null;
  }

  static async create(data: Partial<RefundCalculation>): Promise<RefundCalculationDTO> {
    const refund = await RefundDB.create(data);
    return new RefundCalculation(refund).toDto();
  }

  static async update(calculationId: string, data: Partial<RefundCalculation>): Promise<RefundCalculationDTO | null> {
    const refund = await RefundDB.update(calculationId, data);
    return refund ? new RefundCalculation(refund).toDto() : null;
  }



  /**
   * Calculates refund amount based on rental form type and contract status
   * 
   * Rules:
   * - DEPOSIT type: 80% of deposit
   * - FULL type:
   *   - No contract: 80% deposit + 100% registration fee
   *   - Contract < 6 months: 50% deposit
   *   - Contract ≥ 6 months: 70% deposit
   *   - Contract expired: 100% deposit
   */
  static async calculateRefundAmount(
    requestId: string,
    rentalFormId: string,
    depositAmount: number
  ): Promise<{ refundAmount: number; notes: string }> {
    try {
      // Fetch rental form data
      const rentalForm = await RefundDB.getRentalFormData(rentalFormId);
      if (!rentalForm) {
        throw new Error('Không tìm thấy dữ liệu biểu mẫu đăng ký thuê');
      }

      let refundAmount = 0;
      let notes = '';

      // Case 1: DEPOSIT type (chỉ cọc, chưa đăng ký thuê hết)
      if (rentalForm.type === 'DEPOSIT') {
        refundAmount = depositAmount * 0.8;
        notes = 'Hoàn 80% tiền cọc (chưa có hợp đồng)';
      }
      // Case 2: FULL type (đã cọc + đã đăng ký thuê)
      else if (rentalForm.type === 'FULL') {
        // Try to fetch contract - if no contract exists, full refund
        const contract = await Contract.getByRentalFormId(rentalFormId);

        if (!contract) {
          // No contract: return 80% deposit + 100% registration fee paid
          refundAmount = depositAmount * 0.8 ;
          notes = 'Hoàn 80% tiền cọc (chưa có hợp đồng)';
        } else {
          // Contract exists - check duration
          const contractStartDate = new Date(contract.startDate);
          const currentDate = new Date();
          const monthsDiff = (currentDate.getFullYear() - contractStartDate.getFullYear()) * 12 +
            (currentDate.getMonth() - contractStartDate.getMonth());

          // Check if contract is expired
          if (monthsDiff >= contract.stayDuration) {
            // Contract expired: return 100% deposit
            refundAmount = depositAmount;
            notes = `Hoàn 100% tiền cọc (hết hạn hợp đồng - ${monthsDiff} tháng / ${contract.stayDuration} tháng)`;
          }
          // Contract < 6 months: return 50% deposit
          else if (monthsDiff < 6) {
            refundAmount = depositAmount * 0.5;
            notes = `Hoàn 50% tiền cọc (hợp đồng ${monthsDiff} tháng < 6 tháng)`;
          }
          // Contract ≥ 6 months: return 70% deposit
          else {
            refundAmount = depositAmount * 0.7;
            notes = `Hoàn 70% tiền cọc (hợp đồng ${monthsDiff} tháng ≥ 6 tháng)`;
          }
        }
      }

      return {
        refundAmount: Math.round(refundAmount),
        notes
      };
    } catch (error) {
      console.error('Error calculating refund:', error);
      throw error;
    }
  }

  static async autoCalculateRefundForNoContract(requestId: string, rentalFormId: string) {
    try {
      const existingRefund = await RefundDB.getByRequestId(requestId);
      if (existingRefund) {
        return; // Already calculated
      }

      const rentalForm = await Rental.getRentalFormById(rentalFormId);
      if (!rentalForm) return;

      // Deposit = 2 months of rent (totalAmount is 1 month)
      const depositAmount = rentalForm.totalAmount * 2;
      let refundAmount = 0;
      let notes = '';

      if (rentalForm.type === 'DEPOSIT') {
        // Đã đăng ký cọc, chưa đăng ký thuê, chưa có hợp đồng: hoàn 80% tiền cọc
        refundAmount = depositAmount * 0.8;
        notes = 'Hoàn 80% tiền cọc (chưa có hợp đồng)';
      } else if (rentalForm.type === 'FULL') {
        refundAmount = depositAmount * 0.8;
        notes = 'Hoàn 80% tiền cọc (chưa có hợp đồng)';
      }

      await RefundDB.create({
        requestId: requestId,
        rentalFormId: rentalFormId,
        depositAmount: depositAmount,
        damageFee: 0,
        extraFee: 0,
        finalRefundAmount: refundAmount,
        notes: notes
      });
      console.log(`Auto-calculated refund for request ${requestId} upon accepting (no contract).`);
    } catch (error) {
      console.error('Error auto-calculating refund:', error);
    }
  }
} 
