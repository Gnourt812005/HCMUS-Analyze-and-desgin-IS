import { ContractDB } from '../database/ContractDB';
import { ContractDTO , ContractStatus } from '@dormarch/shared';

export class Contract {
  contractId: string;
  userEmail: string;
  rentalFormId?: string;
  roomId?: string;
  startDate?: string;
  stayDuration?: number;
  depositAmount?: number;
  liquidationUrl?: string;
  signatureUrl?: string;
  createdAt?: string;
  status: ContractStatus;

  constructor(data: Partial<Contract>) {
    this.contractId = data.contractId || '';
    this.userEmail = data.userEmail || '';
    this.rentalFormId = data.rentalFormId;
    this.roomId = data.roomId;
    this.startDate = data.startDate;
    this.stayDuration = data.stayDuration || 0;
    this.depositAmount = data.depositAmount || 0;
    this.liquidationUrl = data.liquidationUrl;
    this.signatureUrl = data.signatureUrl;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.status = data.status || ContractStatus.ACTIVE;
  }
  
  toDto(): ContractDTO {
    return {
      contractId: this.contractId,
      userEmail: this.userEmail,
      rentalFormId: this.rentalFormId,
      roomId: this.roomId,
      startDate: this.startDate,
      stayDuration: this.stayDuration,
      depositAmount: this.depositAmount,
      status: this.status,
      liquidationUrl: this.liquidationUrl,
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
}
