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
      documentUrl: 'https://example.com/contract/req-002.pdf'
    },
    {
      requestId: 'req-003',
      userCCCD: '0123456789',
      contractId: 'contract-001',
      expectedDate: '2005-07-20',
      status: CheckoutStatus.LIQUIDATED,
      createdAt: '2005-06-10',
      documentUrl: 'https://example.com/contract/req-003.pdf'
    }
  ];

  static async getAll(): Promise<Partial<CheckoutRequest>[]> {
    return this.MOCK_CHECKOUT_REQUESTS;
  }

  static async insert(request: CheckoutRequest): Promise<boolean> {
    this.MOCK_CHECKOUT_REQUESTS.push(request);
    return true;
  }

  static async getById(requestId: string): Promise<Partial<CheckoutRequest> | null> {
    const request = this.MOCK_CHECKOUT_REQUESTS.find(r => r.requestId === requestId);
    return request || null;
  }

  static async updateStatus(requestId: string, newStatus: CheckoutStatus): Promise<boolean> {
    const requestIndex = this.MOCK_CHECKOUT_REQUESTS.findIndex(r => r.requestId === requestId);
    if (requestIndex === -1)
      return false;

    this.MOCK_CHECKOUT_REQUESTS[requestIndex].status = newStatus;
    return true;
  }

  static async updateDocuments(requestId: string, documentUrl: string): Promise<boolean> {
    const requestIndex = this.MOCK_CHECKOUT_REQUESTS.findIndex(r => r.requestId === requestId);
    if (requestIndex === -1)
      return false;
    this.MOCK_CHECKOUT_REQUESTS[requestIndex].documentUrl = documentUrl;
    
    return true;
  }
}
