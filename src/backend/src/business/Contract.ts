import { ContractDB } from '../database/ContractDB';
import { ContractDTO, ContractAdminDTO, RentalFormOptionDTO, ContractStatus } from '@dormarch/shared';

export class Contract {
  static async getByUserEmail(userEmail: string): Promise<ContractDTO | null> {
    return ContractDB.getByUserEmail(userEmail);
  }

  static async getByContractId(contractId: string): Promise<ContractDTO | null> {
    return ContractDB.getByContractId(contractId);
  }

  static async getActiveByUserEmail(userEmail: string): Promise<ContractDTO[]> {
    return ContractDB.getActiveByUserEmail(userEmail);
  }

  static async getAllByUserEmail(userEmail: string): Promise<ContractDTO[]> {
    return ContractDB.getAllByUserEmail(userEmail);
  }

  static async updateStatus(contractId: string, status: ContractStatus): Promise<boolean> {
    return ContractDB.updateStatus(contractId, status);
  }

  static async getBedsInfoByContractId(contractId: string): Promise<{ roomId: string; bedIds: string[] } | null> {
    return ContractDB.getBedsInfoByContractId(contractId);
  }

  static async getAll(): Promise<ContractAdminDTO[]> {
    return ContractDB.getAll();
  }

  static async getRentalFormsWithoutContract(): Promise<RentalFormOptionDTO[]> {
    return ContractDB.getRentalFormsWithoutContract();
  }

  static async insert(rentalFormId: string, startDate: string, stayDuration: number): Promise<string> {
    return ContractDB.insert(rentalFormId, startDate, stayDuration);
  }

  static async adminUpdate(contractId: string, startDate: string, stayDuration: number): Promise<boolean> {
    return ContractDB.adminUpdate(contractId, startDate, stayDuration);
  }

  static async cancel(contractId: string): Promise<boolean> {
    return ContractDB.cancel(contractId);
  }
}
