import { ContractDB } from '../database/ContractDB';
import { ContractDTO , ContractStatus } from '@dormarch/shared';

export class Contract {
  contractId: string;
  userCCCD: string;
  roomId?: string;
  startDate?: string;
  stayDuration?: number;
  depositAmount: number;
  liquidationUrl?: string;
  status: ContractStatus;

  constructor(data: Partial<Contract>) {
    this.contractId = data.contractId || '';
    this.userCCCD = data.userCCCD || '';
    this.roomId = data.roomId;
    this.startDate = data.startDate;
    this.stayDuration = data.stayDuration || 0;
    this.depositAmount = data.depositAmount || 0;
    this.liquidationUrl = data.liquidationUrl;
    this.status = data.status || ContractStatus.ACTIVE;
  }
  
  toDto(): ContractDTO {
    return {
      contractId: this.contractId,
      userCCCD: this.userCCCD,
      roomId: this.roomId,
      startDate: this.startDate,
      stayDuration: this.stayDuration,
      depositAmount: this.depositAmount,
      status: this.status,
      liquidationUrl: this.liquidationUrl
    };
  }

  static async getByUserCCCD(userCCCD: string): Promise<ContractDTO | null> {
    const contractModel = await ContractDB.getByUserCCCD(userCCCD);
    return contractModel ? new Contract(contractModel).toDto() : null;
  }

  static async getByContractId(contractId: string): Promise<ContractDTO | null> {
    const contractModel = await ContractDB.getByContractId(contractId);
    return contractModel ? new Contract(contractModel).toDto() : null;
  }

  static async getActiveByUserCCCD(userCCCD: string): Promise<ContractDTO[]> {
    const contractModels = await ContractDB.getActiveByUserCCCD(userCCCD);
    return contractModels.map(model => new Contract(model).toDto());
  }
}
