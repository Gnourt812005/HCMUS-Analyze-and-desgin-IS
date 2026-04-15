import { Contract } from '../business/Contract';

export class ContractDB {
  private static MOCK_CONTRACTS: Partial<Contract>[] = [
    {
      contractId: 'contract-001',
      userCCCD: '0123456789',
      depositAmount: 1000,
      liquidationUrl: 'https://example.com/contract/contract-001.pdf',
      status: 'active'
    }
  ];

  static async getByUserCCCD(userCCCD: string): Promise<Partial<Contract> | null> {
    return this.MOCK_CONTRACTS[0] || null;
  }
}
