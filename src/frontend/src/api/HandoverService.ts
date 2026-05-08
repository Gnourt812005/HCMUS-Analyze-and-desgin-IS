import { ApiClient } from './ApiClient';
import {
  HandoverReportDTO,
  ActiveContractForHandoverDTO,
  CreateHandoverDTO,
} from '@dormarch/shared';

export type { HandoverReportDTO, ActiveContractForHandoverDTO, CreateHandoverDTO };
export type {
  HandoverType,
  EquipmentStatus,
  HandoverBedDTO,
  HandoverUtilityStatusDTO,
  BedForHandoverDTO,
  CreateHandoverBedDTO,
} from '@dormarch/shared';

export class HandoverService {
  static async getAll(): Promise<HandoverReportDTO[]> {
    const res = await ApiClient.get('/handovers');
    return res.data;
  }

  static async getActiveContracts(): Promise<ActiveContractForHandoverDTO[]> {
    const res = await ApiClient.get('/handovers/active-contracts');
    return res.data;
  }

  static async create(payload: CreateHandoverDTO): Promise<{ id: string }> {
    const res = await ApiClient.post('/handovers', { body: JSON.stringify(payload) });
    return res.data;
  }

  static async getByContractId(contractId: string): Promise<HandoverReportDTO[]> {
    const res = await ApiClient.get(`/handovers/by-contract/${contractId}`);
    return res.data;
  }
}
