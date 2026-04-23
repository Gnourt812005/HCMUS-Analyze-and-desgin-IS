export enum CheckoutStatus {
  PENDING = 'PENDING',                           
  PROCESSING = 'PROCESSING',                     
  PENDING_LIQUIDATION = 'PENDING_LIQUIDATION',   
  LIQUIDATED = 'LIQUIDATED',                     
  REJECTED = 'REJECTED',                         
  CANCELLED = 'CANCELLED'                        
}

export interface CheckoutRequestDTO {
  requestId: string;
  userEmail: string;
  contractId?: string;
  expectedDate: string; // ISO Date String
  status: CheckoutStatus;
  handoverId?: string;
  createdAt: string; // ISO Date String
}

export interface RefundCalculationDTO {
  calculationId: string;
  requestId: string;
  contractId?: string;
  depositAmount: number;
  damageFee: number;
  extraFee: number;
  finalRefundAmount: number;
  notes?: string;
  createdAt?: string;
}
