import { CheckoutStatus, CheckoutRequestDTO } from '@dormarch/shared';
import { CheckoutRequestDB } from '../database/CheckoutRequestDB';

export class CheckoutRequest {
  requestId: string; // PK
  userEmail: string;
  contractId?: string;
  expectedDate: string; // ISO Date String
  status: CheckoutStatus;
  handoverId?: string;
  createdAt: string; // ISO Date String

  constructor(data: Partial<CheckoutRequest>) {
    this.requestId = data.requestId || '';
    this.userEmail = data.userEmail || '';
    this.contractId = data.contractId;
    this.expectedDate = data.expectedDate || new Date().toISOString();
    this.status = data.status || CheckoutStatus.PENDING;
    this.handoverId = data.handoverId;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toDto(): CheckoutRequestDTO {
    return {
      requestId: this.requestId,
      userEmail: this.userEmail,
      contractId: this.contractId,
      expectedDate: this.expectedDate,
      status: this.status,
      handoverId: this.handoverId,
      createdAt: this.createdAt,
    };
  }

  static async getList(): Promise<CheckoutRequestDTO[]> {
    const requestModels = await CheckoutRequestDB.getAll();
    return requestModels.map(model => new CheckoutRequest(model).toDto());
  }

  static async create(requestData: Partial<CheckoutRequestDTO>): Promise<CheckoutRequestDTO> {
    if (!requestData.userEmail || !requestData.expectedDate || !requestData.contractId) {
      throw new Error('userEmail, contractId và expectedDate là bắt buộc.');
    }

    const newRequest = new CheckoutRequest({
      userEmail: requestData.userEmail,
      contractId: requestData.contractId,
      expectedDate: requestData.expectedDate,
      createdAt: new Date().toISOString(),
      status: CheckoutStatus.PENDING
    });
    
    const insertedId = await CheckoutRequestDB.insert(newRequest);
    if (insertedId) newRequest.requestId = insertedId;
    
    return newRequest.toDto();
  }

  static async createWithDuplicateCheck(requestData: Partial<CheckoutRequestDTO>): Promise<{ success: boolean; request?: CheckoutRequestDTO; error?: string }> {
    if (!requestData.userEmail || !requestData.expectedDate || !requestData.contractId) {
      throw new Error('userEmail, contractId và expectedDate là bắt buộc.');
    }

    const newRequest = new CheckoutRequest({
      userEmail: requestData.userEmail,
      contractId: requestData.contractId,
      expectedDate: requestData.expectedDate,
      createdAt: new Date().toISOString(),
      status: CheckoutStatus.PENDING
    });
    
    const result = await CheckoutRequestDB.insertIfNoActiveRequest(
      newRequest,
      requestData.contractId,
      requestData.userEmail
    );

    if (result.success) {
      if (result.requestId) newRequest.requestId = result.requestId;
      return { success: true, request: newRequest.toDto() };
    } else {
      return { success: false, error: result.error };
    }
  }

  static async getById(requestId: string): Promise<CheckoutRequestDTO | null> {
    const requestModel = await CheckoutRequestDB.getById(requestId);
    return requestModel ? new CheckoutRequest(requestModel).toDto() : null;
  }

  static async updateStatus(requestId: string, newStatus: CheckoutStatus, expectedCurrentStatus?: CheckoutStatus): Promise<boolean> {
    const currentRequest = await CheckoutRequestDB.getById(requestId);
    if (!currentRequest) {
      return false;
    }

    const currentStatus = currentRequest.status;
    if (expectedCurrentStatus !== undefined && currentStatus !== expectedCurrentStatus) {
      throw new Error('Yêu cầu đã được cập nhật. Vui lòng làm mới và thử lại.');
    }

    const validTransitions: Record<CheckoutStatus, CheckoutStatus[]> = {
      [CheckoutStatus.PENDING]: [CheckoutStatus.PROCESSING, CheckoutStatus.CANCELLED],
      [CheckoutStatus.PROCESSING]: [CheckoutStatus.LIQUIDATED, CheckoutStatus.CANCELLED],
      [CheckoutStatus.LIQUIDATED]: [], 
      [CheckoutStatus.CANCELLED]: [] 
    };

    const allowedTransitions = validTransitions[currentStatus!] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        'Không thể cập nhật trạng thái yêu cầu trả phòng vào lúc này.'
      );
    }

    return await CheckoutRequestDB.updateStatus(requestId, newStatus, expectedCurrentStatus);
  }
}
