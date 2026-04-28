import { HandoverDB } from '../database/HandoverDB';
import {
  HandoverReportDTO,
  ActiveContractForHandoverDTO,
  CreateHandoverDTO,
} from '@dormarch/shared';

export class Handover {
  static async getAll(): Promise<HandoverReportDTO[]> {
    return HandoverDB.getAll();
  }

  static async getById(id: string): Promise<HandoverReportDTO | null> {
    return HandoverDB.getById(id);
  }

  static async getByContractId(contractId: string): Promise<HandoverReportDTO[]> {
    return HandoverDB.getByContractId(contractId);
  }

  static async getActiveContracts(): Promise<ActiveContractForHandoverDTO[]> {
    return HandoverDB.getActiveContracts();
  }

  static async create(data: CreateHandoverDTO): Promise<string> {
    if (!data.contractId) throw new Error('contractId là bắt buộc');
    if (!data.beds || data.beds.length === 0) throw new Error('Phải có ít nhất 1 giường');
    return HandoverDB.insert(data.contractId, data.type, data.beds, data.note || '');
  }
}
