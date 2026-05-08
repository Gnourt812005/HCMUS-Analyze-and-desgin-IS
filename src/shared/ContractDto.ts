export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  TERMINATED = 'TERMINATED',
  LIQUIDATED = 'LIQUIDATED'
}

export interface ContractDTO {
  contractId: string;
  contractCode?: string;
  userEmail: string;
  rentalFormId?: string;
  roomId?: string;
  roomName?: string;
  dormName?: string;
  floor?: number;
  bedNumbers?: string;
  monthlyRent?: number;
  startDate?: string;
  depositAmount?: number;
  stayDuration?: number;
  status?: ContractStatus;
  signatureUrl?: string;
  createdAt?: string;
}

export interface ContractAdminDTO {
  id: string;
  contractCode: string | null;
  userEmail: string;
  rentalFormId: string | null;
  startDate: string;
  stayDuration: number;
  status: string;
  signatureUrl: string | null;
  createdAt: string;
  customerName: string;
  phone: string | null;
  cccd: string | null;
  roomName: string | null;
  bedNumbers: string[];
  monthlyRent: number;
}

export interface DormFeesDTO {
  electricityFee: number;
  waterFee: number;
  wifiFee: number;
  cleaningFee: number;
}

export interface RentalFormOptionDTO {
  id: string;
  customerName: string;
  phone: string | null;
  cccd: string | null;
  roomName: string | null;
  bedNumbers: string[];
  monthlyRent: number;
  rentalMonths: number;
  totalAmount: number;
  createdAt: string;
}
