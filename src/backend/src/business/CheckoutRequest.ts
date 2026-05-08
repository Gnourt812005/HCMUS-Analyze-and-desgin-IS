import { CheckoutStatus, CheckoutRequestDTO } from '@dormarch/shared';
import { CheckoutRequestDB } from '../database/CheckoutRequestDB';

export class CheckoutRequest {
  requestId: string; // PK
  code?: string; // Display code
  userEmail: string;
  userFullName?: string;
  rentalFormId?: string;
  dormName?: string;
  roomName?: string;
  floor?: number;
  bedNumbers?: string;
  expectedDate: string; // ISO Date String
  status: CheckoutStatus;
  createdAt: string; // ISO Date String

  constructor(data: Partial<CheckoutRequest>) {
    this.requestId = data.requestId || '';
    this.code = data.code;
    this.userEmail = data.userEmail || '';
    this.userFullName = data.userFullName;
    this.rentalFormId = data.rentalFormId;
    this.dormName = data.dormName;
    this.roomName = data.roomName;
    this.floor = data.floor;
    this.bedNumbers = data.bedNumbers;
    this.expectedDate = data.expectedDate || new Date().toISOString();
    this.status = data.status || CheckoutStatus.PENDING;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toDto(): CheckoutRequestDTO {
    return {
      requestId: this.requestId,
      code: this.code,
      userEmail: this.userEmail,
      userFullName: this.userFullName,
      rentalFormId: this.rentalFormId,
      dormName: this.dormName,
      roomName: this.roomName,
      floor: this.floor,
      bedNumbers: this.bedNumbers,
      expectedDate: this.expectedDate,
      status: this.status,
      createdAt: this.createdAt,
    };
  }

  static async getList(): Promise<CheckoutRequestDTO[]> {
    const requestModels = await CheckoutRequestDB.getAll();
    return requestModels.map(model => new CheckoutRequest(model).toDto());
  }

  static async getListByUserEmail(userEmail: string): Promise<CheckoutRequestDTO[]> {
    const requestModels = await CheckoutRequestDB.getByUserEmail(userEmail);
    return requestModels.map(model => new CheckoutRequest(model).toDto());
  }

  static async create(requestData: Partial<CheckoutRequestDTO>): Promise<CheckoutRequestDTO> {
    if (!requestData.userEmail || !requestData.expectedDate || !requestData.rentalFormId) {
      throw new Error('userEmail, rentalFormId và expectedDate là bắt buộc.');
    }

    const newRequest = new CheckoutRequest({
      userEmail: requestData.userEmail,
      rentalFormId: requestData.rentalFormId,
      expectedDate: requestData.expectedDate,
      createdAt: new Date().toISOString(),
      status: CheckoutStatus.PENDING
    });
    
    const insertedId = await CheckoutRequestDB.insert(newRequest);
    if (insertedId) newRequest.requestId = insertedId;
    
    return newRequest.toDto();
  }

  static async createWithDuplicateCheck(requestData: Partial<CheckoutRequestDTO>): Promise<{ success: boolean; request?: CheckoutRequestDTO; error?: string }> {
    if (!requestData.userEmail || !requestData.expectedDate || !requestData.rentalFormId) {
      throw new Error('userEmail, rentalFormId và expectedDate là bắt buộc.');
    }

    const newRequest = new CheckoutRequest({
      userEmail: requestData.userEmail,
      rentalFormId: requestData.rentalFormId,
      expectedDate: requestData.expectedDate,
      createdAt: new Date().toISOString(),
      status: CheckoutStatus.PENDING
    });
    
    const result = await CheckoutRequestDB.insertIfNoActiveRequest(
      newRequest,
      requestData.rentalFormId,
      requestData.userEmail
    );

    if (!result.success || !result.requestId) {
      return { success: false, error: result.error };
    }

    const fullRequest = await this.getById(result.requestId);
    return { success: true, request: fullRequest || undefined };
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
      [CheckoutStatus.PENDING]: [CheckoutStatus.PROCESSING, CheckoutStatus.LIQUIDATED, CheckoutStatus.CANCELLED],
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
