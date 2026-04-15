import { RefundDB } from '../database/RefundDB';
import { RefundCalculationDTO } from '@dormarch/shared';

export class RefundCalculation {
  calculationId: string;
  requestId: string;
  depositAmount: number;
  damageFee: number;
  extraFee: number;
  finalRefundAmount: number;

  constructor(data: Partial<RefundCalculation>) {
    this.calculationId = data.calculationId || '';
    this.requestId = data.requestId || '';
    this.depositAmount = data.depositAmount || 0;
    this.damageFee = data.damageFee || 0;
    this.extraFee = data.extraFee || 0;
    this.finalRefundAmount = data.finalRefundAmount || 0;
  }

  toDto(): RefundCalculationDTO {
    return {
      calculationId: this.calculationId,
      requestId: this.requestId,
      depositAmount: this.depositAmount,
      damageFee: this.damageFee,
      extraFee: this.extraFee,
      finalRefundAmount: this.finalRefundAmount
    };
  }

  static async getByRequestId(requestId: string): Promise<RefundCalculationDTO | null> {
    const refund = await RefundDB.getByRequestId(requestId);
    return refund ? new RefundCalculation(refund).toDto() : null;
  }
} 
