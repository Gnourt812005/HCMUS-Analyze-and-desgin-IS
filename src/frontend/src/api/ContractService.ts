import { ApiClient } from './ApiClient';
import { ContractDTO, ContractAdminDTO, RentalFormOptionDTO, DormFeesDTO } from '@dormarch/shared';

export { ContractStatus } from '@dormarch/shared';
export type { ContractAdminDTO, RentalFormOptionDTO, DormFeesDTO };

export class ContractService {
  static async getAll(): Promise<ContractAdminDTO[]> {
    const res = await ApiClient.get('/admin/contracts/all');
    return res.data;
  }

  static async getRentalForms(): Promise<RentalFormOptionDTO[]> {
    const res = await ApiClient.get('/admin/contracts/rental-forms');
    return res.data;
  }

  static async create(payload: {
    rentalFormId: string;
    startDate: string;
    stayDuration: number;
  }): Promise<{ id: string }> {
    const res = await ApiClient.post('/admin/contracts', { body: JSON.stringify(payload) });
    return res.data;
  }

  static async update(id: string, payload: { startDate: string; stayDuration: number }): Promise<void> {
    await ApiClient.put(`/admin/contracts/${id}`, { body: JSON.stringify(payload) });
  }

  static async cancel(id: string): Promise<void> {
    await ApiClient.patch(`/admin/contracts/${id}/cancel`);
  }

  static async getMyContracts(): Promise<ContractDTO[]> {
    return ApiClient.get<ContractDTO[]>('/contracts/mine');
  }

  static async getFees(contractId: string): Promise<DormFeesDTO | null> {
    try {
      const res = await ApiClient.get(`/admin/contracts/${contractId}/fees`);
      return res.data;
    } catch {
      return null;
    }
  }
}
