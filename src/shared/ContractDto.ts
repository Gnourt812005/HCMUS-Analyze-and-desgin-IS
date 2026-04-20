export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_CHECKOUT = 'PENDING_CHECKOUT',
  LIQUIDATED = 'LIQUIDATED'
}

export interface ContractDTO {
  contractId: string;
  userCCCD?: string;
  roomId?: string;
  startDate?: string;
  stayDuration?: number;
  depositAmount: number;
  status?: ContractStatus;
  liquidationUrl?: string;
}
