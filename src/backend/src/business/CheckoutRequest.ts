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
      userCCCD: this.userCCCD,
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
    if (!requestData.userCCCD || !requestData.expectedDate || !requestData.contractId) {
      throw new Error('userCCCD, contractId và expectedDate là bắt buộc.');
    }

    const newRequest = new CheckoutRequest({
      userCCCD: requestData.userCCCD,
      contractId: requestData.contractId,
      expectedDate: requestData.expectedDate,
      documentUrl: requestData.documentUrl,
      requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: CheckoutStatus.PENDING
    });
    await CheckoutRequestDB.insert(newRequest);
    return newRequest.toDto();
  }

  static async createWithDuplicateCheck(requestData: Partial<CheckoutRequestDTO>): Promise<{ success: boolean; request?: CheckoutRequestDTO; error?: string }> {
    if (!requestData.userCCCD || !requestData.expectedDate || !requestData.contractId) {
      throw new Error('userCCCD, contractId và expectedDate là bắt buộc.');
    }

    const newRequest = new CheckoutRequest({
      userCCCD: requestData.userCCCD,
      contractId: requestData.contractId,
      expectedDate: requestData.expectedDate,
      documentUrl: requestData.documentUrl,
      requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: CheckoutStatus.PENDING
    });
    
    const result = await CheckoutRequestDB.insertIfNoActiveRequest(
      newRequest,
      requestData.contractId,
      requestData.userCCCD
    );

    if (result.success) {
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
      throw new Error('Yêu cầu đã được cập nhật bởi quản trị viên khác. Vui lòng làm mới và thử lại.');
    }

    // Define valid status transitions
    const validTransitions: Record<CheckoutStatus, CheckoutStatus[]> = {
      [CheckoutStatus.PENDING]: [CheckoutStatus.PROCESSING, CheckoutStatus.REJECTED, CheckoutStatus.CANCELLED],
      [CheckoutStatus.PROCESSING]: [CheckoutStatus.PENDING_LIQUIDATION, CheckoutStatus.REJECTED, CheckoutStatus.CANCELLED],
      [CheckoutStatus.PENDING_LIQUIDATION]: [CheckoutStatus.LIQUIDATED, CheckoutStatus.CANCELLED],
      [CheckoutStatus.LIQUIDATED]: [], 
      [CheckoutStatus.REJECTED]: [], 
      [CheckoutStatus.CANCELLED]: [] 
    };

    // Check if the transition is valid
    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        'Không thể cập nhật trạng thái yêu cầu trả phòng vào lúc này.'
      );
    }

    return await CheckoutRequestDB.updateStatus(requestId, newStatus, expectedCurrentStatus);
  }
}
