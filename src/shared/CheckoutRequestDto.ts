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
  userCCCD: string;
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
  notes?: string;
}

