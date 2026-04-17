export interface ContractDTO {
  contractId: string;
  userCCCD?: string;
  roomId?: string;
  startDate?: string;
  stayDuration?: number;
  depositAmount: number;
  status?: string;
  liquidationUrl?: string;
}
