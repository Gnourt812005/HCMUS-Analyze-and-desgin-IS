export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_CHECKOUT = 'PENDING_CHECKOUT',
  LIQUIDATED = 'LIQUIDATED'
}

export interface ContractDTO {
  contractId: string;
  userEmail: string;
  rentalFormId?: string;
  roomId?: string;
  startDate?: string;
  stayDuration?: number;
  depositAmount?: number;
  status?: ContractStatus;
  signatureUrl?: string;
  liquidationUrl?: string;
  createdAt?: string;
}
