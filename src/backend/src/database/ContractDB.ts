import { Contract } from '../business/Contract';

export class ContractDB {
  private static MOCK_CONTRACTS: Partial<Contract>[] = [
    {
      contractId: 'contract-001',
      userCCCD: '079201012345',
      roomId: 'A101',
      startDate: '2024-01-15',
      stayDuration: 6,
      depositAmount: 1000000,
      liquidationUrl: 'https://example.com/contract/contract-001.pdf',
      status: 'ACTIVE'
    },
    {
      contractId: 'contract-002',
      userCCCD: '0987654321',
      roomId: 'B202',
      startDate: '2024-02-01',
      stayDuration: 12,
      depositAmount: 1500000,
      liquidationUrl: 'https://example.com/contract/contract-002.pdf',
      status: 'ACTIVE'
    }
  ];

  static async getByUserCCCD(userCCCD: string): Promise<Partial<Contract> | null> {
    return this.MOCK_CONTRACTS.find(contract => contract.userCCCD === userCCCD) || null;
  }

  static async getByContractId(contractId: string): Promise<Partial<Contract> | null> {
    return this.MOCK_CONTRACTS.find(contract => contract.contractId === contractId) || null;
  }

  static async getActiveByUserCCCD(userCCCD: string): Promise<Partial<Contract>[]> {
    return this.MOCK_CONTRACTS.filter(contract => contract.userCCCD === userCCCD && contract.status === 'ACTIVE');
  }

  static async updateLiquidationUrl(contractId: string, liquidationUrl: string): Promise<boolean> {
    const contractIndex = this.MOCK_CONTRACTS.findIndex(c => c.contractId === contractId);
    if (contractIndex === -1)
      return false;
    
    this.MOCK_CONTRACTS[contractIndex].liquidationUrl = liquidationUrl;
    return true;
  }

  static async updateStatus(contractId: string, status: string): Promise<boolean> {
    const contractIndex = this.MOCK_CONTRACTS.findIndex(c => c.contractId === contractId);
    if (contractIndex === -1)
      return false;
    
    this.MOCK_CONTRACTS[contractIndex].status = status;
    return true;
  }
}
