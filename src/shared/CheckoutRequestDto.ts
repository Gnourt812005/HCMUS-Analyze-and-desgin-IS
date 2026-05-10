export enum CheckoutStatus {
  PENDING = 'PENDING',                           
  PROCESSING = 'PROCESSING',                     
  LIQUIDATED = 'LIQUIDATED',                     
  CANCELLED = 'CANCELLED'                        
}

export interface CheckoutRequestDTO {
  requestId: string;
  code?: string;
  userEmail: string;
  userFullName?: string;
  dormId?: string;
  dormName?: string;
  roomName?: string;
  floor?: number;
  bedNumbers?: string;
  rentalFormId?: string;
  expectedDate: string; // ISO Date String
  status: CheckoutStatus;
  handoverId?: string;
  createdAt: string; // ISO Date String
}

export interface RefundCalculationDTO {
  calculationId: string;
  requestId: string;
  rentalFormId?: string;
  depositAmount: number;
  damageFee: number;
  extraFee: number;
  finalRefundAmount: number;
  notes?: string;
  createdAt?: string;
}
