import { RefundCalculation } from "../business/RefundCalculation";

export class RefundDB {
  private static MOCK_REFUNDS: Partial<RefundCalculation>[] = [
    {
      calculationId: 'calc-001',
      requestId: 'req-001',
      contractId: 'contract-001',
      depositAmount: 1000,
      damageFee: 200,
      extraFee: 50,
      finalRefundAmount: 750,
      notes: 'Khấu trừ phí làm hỏng cửa'
    }
  ];

  static async getByRequestId(requestId: string): Promise<Partial<RefundCalculation> | null> {
    const refund = this.MOCK_REFUNDS.find(r => r.requestId === requestId);
    return refund || null;
  }

  static async getById(calculationId: string): Promise<Partial<RefundCalculation> | null> {
    const refund = this.MOCK_REFUNDS.find(r => r.calculationId === calculationId);
    return refund || null;
  }

  static async create(data: Partial<RefundCalculation>): Promise<Partial<RefundCalculation>> {
    const newRefund: Partial<RefundCalculation> = {
      ...data,
      calculationId: `calc-${Date.now()}`,
    };
    this.MOCK_REFUNDS.push(newRefund);
    return newRefund;
  }

  static async update(calculationId: string, data: Partial<RefundCalculation>): Promise<Partial<RefundCalculation> | null> {
    const index = this.MOCK_REFUNDS.findIndex(r => r.calculationId === calculationId);
    if (index === -1)
      return null;
    
    const updated = { ...this.MOCK_REFUNDS[index], ...data, calculationId };
    this.MOCK_REFUNDS[index] = updated;
    return updated;
  }
}
