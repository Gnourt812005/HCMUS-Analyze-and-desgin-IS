export interface ContractDTO {
  contractId: string;
  customerId?: string;
  roomId?: string;
  startDate?: string;
  stayDuration?: number;
  depositAmount: number;
  status?: string;
  liquidationUrl?: string;
}
