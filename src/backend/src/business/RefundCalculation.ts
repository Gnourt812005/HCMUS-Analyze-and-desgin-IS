import { RefundDB } from '../database/RefundDB';
import { RefundCalculationDTO } from '@dormarch/shared';

export class RefundCalculation {
  calculationId: string;
  requestId: string;
  contractId?: string;
  depositAmount: number;
  damageFee: number;
  extraFee: number;
  finalRefundAmount: number;
  notes?: string;

  constructor(data: Partial<RefundCalculation>) {
    this.calculationId = data.calculationId || '';
    this.requestId = data.requestId || '';
    this.contractId = data.contractId;
    this.depositAmount = data.depositAmount || 0;
    this.damageFee = data.damageFee || 0;
    this.extraFee = data.extraFee || 0;
    this.finalRefundAmount = data.finalRefundAmount || 0;
    this.notes = data.notes;
  }

  toDto(): RefundCalculationDTO {
    return {
      calculationId: this.calculationId,
      requestId: this.requestId,
      // contractId: this.contractId,
      depositAmount: this.depositAmount,
      damageFee: this.damageFee,
      extraFee: this.extraFee,
      finalRefundAmount: this.finalRefundAmount,
      notes: this.notes
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
} 
