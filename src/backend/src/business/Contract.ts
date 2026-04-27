import { ContractDB } from '../database/ContractDB';
import { ContractDTO , ContractStatus } from '@dormarch/shared';

export class Contract {
  contractId: string;
  userEmail: string;
  rentalFormId?: string;
  roomId?: string;
  roomName?: string;
  dormName?: string;
  floor?: number;
  bedNumbers?: string;
  startDate?: string;
  depositAmount?: number;
  stayDuration?: number;
  signatureUrl?: string;
  createdAt?: string;
  status: ContractStatus;

  constructor(data: Partial<Contract>) {
    this.contractId = data.contractId || '';
    this.userEmail = data.userEmail || '';
    this.rentalFormId = data.rentalFormId;
    this.roomId = data.roomId;
    this.roomName = data.roomName;
    this.dormName = data.dormName;
    this.floor = data.floor;
    this.bedNumbers = data.bedNumbers;
    this.startDate = data.startDate;
    this.depositAmount = data.depositAmount;
    this.stayDuration = data.stayDuration || 0;
    this.signatureUrl = data.signatureUrl;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.status = data.status || ContractStatus.ACTIVE;
  }
  
  toDto(): ContractDTO {
    return {
      contractId: this.contractId,
      userEmail: this.userEmail,
      rentalFormId: this.rentalFormId,
      dormName: this.dormName,
      floor: this.floor,
      bedNumbers: this.bedNumbers,
      startDate: this.startDate,
      depositAmount: this.depositAmount,
      stayDuration: this.stayDuration,
      status: this.status,
      signatureUrl: this.signatureUrl,
      createdAt: this.createdAt
    };
  }

  static async getByUserEmail(userEmail: string): Promise<ContractDTO | null> {
    const contractModel = await ContractDB.getByUserEmail(userEmail);
    return contractModel ? new Contract(contractModel).toDto() : null;
  }

  static async getByContractId(contractId: string): Promise<ContractDTO | null> {
    const contractModel = await ContractDB.getByContractId(contractId);
    return contractModel ? new Contract(contractModel).toDto() : null;
  }

  static async getActiveByUserEmail(userEmail: string): Promise<ContractDTO[]> {
    const contractModels = await ContractDB.getActiveByUserEmail(userEmail);
    return contractModels.map(model => new Contract(model).toDto());
  }

  static async getAllByUserEmail(userEmail: string): Promise<ContractDTO[]> {
    const contractModels = await ContractDB.getAllByUserEmail(userEmail);
    return contractModels.map(model => new Contract(model).toDto());
  }
}
