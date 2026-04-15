import { RefundCalculation } from "../business/RefundCalculation";

export class RefundDB {
  private static MOCK_REFUNDS: Partial<RefundCalculation>[] = [
    {
      calculationId: 'calc-001',
      requestId: 'req-001',
      depositAmount: 1000,
      damageFee: 200,
      extraFee: 50,
      finalRefundAmount: 750
    }
  ];

  static async getByRequestId(requestId: string): Promise<Partial<RefundCalculation> | null> {
    const refund = this.MOCK_REFUNDS.find(r => r.requestId === requestId);
    return refund || null;
  }
}
