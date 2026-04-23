import { Contract } from '../business/Contract';
import { ContractStatus } from '@dormarch/shared';

export class ContractDB {
  private static MOCK_CONTRACTS: Partial<Contract>[] = [
    {
      contractId: 'contract-001',
      userEmail: 'test@gmail.com',
      rentalFormId: 'reg-001',
      roomId: 'A101',
      startDate: '2024-01-15',
      stayDuration: 6,
      depositAmount: 1000000,
      signatureUrl: 'https://example.com/signature/contract-001.png',
      status: ContractStatus.ACTIVE,
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      contractId: 'contract-002',
      userEmail: 'test@gmail.com',
      rentalFormId: 'reg-002',
      roomId: 'B202',
      startDate: '2024-02-01',
      stayDuration: 12,
      depositAmount: 1500000,
      status: ContractStatus.ACTIVE,
      createdAt: '2024-01-25T10:00:00Z'
    },
    {
      contractId: 'contract-003',
      userEmail: 'test2@gmail.com',
      roomId: 'C303',
      startDate: '2024-03-01',
      stayDuration: 3,
      depositAmount: 800000,
      status: ContractStatus.PENDING_CHECKOUT,
      createdAt: '2024-02-25T10:00:00Z'
    }
  ];

  static async getByUserEmail(userEmail: string): Promise<Partial<Contract> | null> {
    return this.MOCK_CONTRACTS.find(contract => contract.userEmail === userEmail) || null;
  }

  static async getByContractId(contractId: string): Promise<Partial<Contract> | null> {
    return this.MOCK_CONTRACTS.find(contract => contract.contractId === contractId) || null;
  }

  static async getActiveByUserEmail(userEmail: string): Promise<Partial<Contract>[]> {
    return this.MOCK_CONTRACTS.filter(contract => contract.userEmail === userEmail && contract.status === ContractStatus.ACTIVE);
  }

  static async updateStatus(contractId: string, status: ContractStatus): Promise<boolean> {
    const contractIndex = this.MOCK_CONTRACTS.findIndex(c => c.contractId === contractId);
    if (contractIndex === -1)
      return false;
    
    this.MOCK_CONTRACTS[contractIndex].status = status as ContractStatus;
    return true;
  }
}
