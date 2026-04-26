export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  TERMINATED = 'TERMINATED',
  LIQUIDATED = 'LIQUIDATED'
}

export interface ContractDTO {
  contractId: string;
  userEmail: string;
  rentalFormId?: string;
  userCCCD?: string;
  roomId?: string;
  dormName?: string;
  floor?: number;
  bedNumbers?: string;
  startDate?: string;
  depositAmount?: number;
  stayDuration?: number;
  status?: ContractStatus;
  signatureUrl?: string;
  createdAt?: string;
}

// export interface ContractDTO {
//   contractId: string;
//   userEmail: string;
//   rentalFormId?: string;
//   userCCCD?: string;
//   roomId?: string;
//   dormName?: string;
//   floor?: number;
//   bedNumbers?: string;
//   startDate?: string;
//   depositAmount?: number;
//   stayDuration?: number;
//   status?: ContractStatus;
//   signatureUrl?: string;
//   createdAt?: string;
// }