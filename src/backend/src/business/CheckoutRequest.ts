import { CheckoutStatus, CheckoutRequestDTO } from '@dormarch/shared';
import { CheckoutRequestDB } from '../database/CheckoutRequestDB';

export class CheckoutRequest {
  requestId: string; // PK
  userCCCD: string;
  contractId?: string;
  expectedDate: string; // ISO Date String
  status: CheckoutStatus;
  createdAt: string; // ISO Date String
  documentUrl?: string;

  constructor(data: Partial<CheckoutRequest>) {
    this.requestId = data.requestId || '';
    this.userCCCD = data.userCCCD || '';
    this.contractId = data.contractId;
    this.expectedDate = data.expectedDate || new Date().toISOString();
    this.status = data.status || CheckoutStatus.PENDING;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.documentUrl = data.documentUrl;
  }

  toDto(): CheckoutRequestDTO {
    return {
      requestId: this.requestId,
      customerId: this.userCCCD, // Map backend CCCD to frontend customerId
      contractId: this.contractId,
      expectedDate: this.expectedDate,
      status: this.status,
      createdAt: this.createdAt,
      documentUrl: this.documentUrl
    };
  }

  static async getList(): Promise<CheckoutRequestDTO[]> {
    const requestModels = await CheckoutRequestDB.getAll();
    return requestModels.map(model => new CheckoutRequest(model).toDto());
  }

  static async create(requestData: Partial<CheckoutRequestDTO>): Promise<CheckoutRequestDTO> {
    if (!requestData.customerId || !requestData.expectedDate || !requestData.contractId) {
      throw new Error('customerId, contractId và expectedDate là bắt buộc.');
    }

    const newRequest = new CheckoutRequest({
      userCCCD: requestData.customerId, // Map frontend DTO to backend Model
      contractId: requestData.contractId,
      expectedDate: requestData.expectedDate,
      documentUrl: requestData.documentUrl,
      requestId: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: CheckoutStatus.PENDING
    });
    await CheckoutRequestDB.insert(newRequest);
    return newRequest.toDto();
  }

  static async getById(requestId: string): Promise<CheckoutRequestDTO | null> {
    const requestModel = await CheckoutRequestDB.getById(requestId);
    return requestModel ? new CheckoutRequest(requestModel).toDto() : null;
  }

  static async updateStatus(requestId: string, newStatus: CheckoutStatus): Promise<boolean> {
    return await CheckoutRequestDB.updateStatus(requestId, newStatus);
  }
}
