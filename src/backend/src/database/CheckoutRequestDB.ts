import { CheckoutStatus } from '@dormarch/shared';
import { CheckoutRequest } from '../business/CheckoutRequest';

export class CheckoutRequestDB {
  private static MOCK_CHECKOUT_REQUESTS: Partial<CheckoutRequest>[] = [
    {
      requestId: 'req-001',
      userCCCD: '0123456789',
      contractId: 'contract-001',
      expectedDate: '2005-06-30',
      status: CheckoutStatus.PENDING,
      createdAt: '2005-06-01'
    },
    {
      requestId: 'req-002',
      userCCCD: '0987654321',
      contractId: 'contract-002',
      expectedDate: '2005-07-15',
      status: CheckoutStatus.PROCESSING,
      createdAt: '2005-06-05',
    },
    {
      requestId: 'req-003',
      userCCCD: '0123456789',
      contractId: 'contract-001',
      expectedDate: '2005-07-20',
      status: CheckoutStatus.LIQUIDATED,
      createdAt: '2005-06-10',
    }
  ];

  static async getAll(): Promise<Partial<CheckoutRequest>[]> {
    return this.MOCK_CHECKOUT_REQUESTS;
  }

  static async insert(request: CheckoutRequest): Promise<boolean> {
    this.MOCK_CHECKOUT_REQUESTS.push(request);
    return true;
  }

  static async insertIfNoActiveRequest(request: CheckoutRequest, contractId: string, userCCCD: string): Promise<{ success: boolean; error?: string }> {
    // Atomic check-and-insert: check for active request, return error if exists
    const existingActive = this.MOCK_CHECKOUT_REQUESTS.find(r =>
      r.contractId === contractId &&
      r.userCCCD === userCCCD &&
      [CheckoutStatus.PENDING, CheckoutStatus.PROCESSING, CheckoutStatus.PENDING_LIQUIDATION].includes(r.status as CheckoutStatus)
    );

    if (existingActive) {
      return { success: false, error: 'Đã có yêu cầu trả phòng đang xử lý cho hợp đồng này.' };
    }

    this.MOCK_CHECKOUT_REQUESTS.push(request);
    return { success: true };
  }

  static async getById(requestId: string): Promise<Partial<CheckoutRequest> | null> {
    const request = this.MOCK_CHECKOUT_REQUESTS.find(r => r.requestId === requestId);
    return request || null;
  }

  static async updateStatus(requestId: string, newStatus: CheckoutStatus, expectedStatus?: CheckoutStatus): Promise<boolean> {
    const requestIndex = this.MOCK_CHECKOUT_REQUESTS.findIndex(r => r.requestId === requestId);
    if (requestIndex === -1)
      return false;

    const existingRequest = this.MOCK_CHECKOUT_REQUESTS[requestIndex];
    if (expectedStatus !== undefined && existingRequest.status !== expectedStatus) {
      return false;
    }

    this.MOCK_CHECKOUT_REQUESTS[requestIndex].status = newStatus;
    return true;
  }
}
