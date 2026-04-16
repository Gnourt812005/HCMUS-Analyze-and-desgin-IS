export enum CheckoutStatus {
  PENDING = 'PENDING',           // Chờ xử lý
  PROCESSING = 'PROCESSING',     // Đang xử lý
  LIQUIDATED = 'LIQUIDATED',     // Đã thanh lý
  REJECTED = 'REJECTED',         // Từ chối
  CANCELLED = 'CANCELLED'        // Đã hủy
}

export interface CheckoutRequestDTO {
  requestId: string;
  customerId: string;
  contractId?: string;
  expectedDate: string; // ISO Date String
  status: CheckoutStatus;
  createdAt: string; // ISO Date String
  documentUrl?: string;
}

export interface RefundCalculationDTO {
  calculationId: string;
  requestId: string;
  depositAmount: number;
  damageFee: number;
  extraFee: number;
  finalRefundAmount: number;
}

