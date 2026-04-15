import { ContractDTO } from '@dormarch/shared';

export class Contract {
  contractId: string;
  userCCCD: string;
  depositAmount: number;
  liquidationUrl?: string;
  status: 'active' | 'terminated';

  constructor(data: Partial<Contract>) {
    this.contractId = data.contractId || '';
    this.userCCCD = data.userCCCD || '';
    this.depositAmount = data.depositAmount || 0;
    this.liquidationUrl = data.liquidationUrl;
    this.status = data.status || 'active';
  } 

  toDto(): ContractDTO {
    return {
      contractId: this.contractId,
      depositAmount: this.depositAmount,
      liquidationUrl: this.liquidationUrl
    };
  }
}
