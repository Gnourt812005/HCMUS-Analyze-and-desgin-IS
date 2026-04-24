import { ApiClient } from './ApiClient';

export type ContractStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_CHECKOUT' | 'LIQUIDATED';

export interface ContractAdminRow {
  id: string;
  userEmail: string;
  rentalFormId: string | null;
  startDate: string;
  stayDuration: number;
  status: ContractStatus;
  signatureUrl: string | null;
  createdAt: string;
  customerName: string;
  phone: string | null;
  cccd: string | null;
  roomName: string | null;
  bedNumbers: string[];
}

export interface RentalFormOption {
  id: string;
  customerName: string;
  phone: string | null;
  cccd: string | null;
  roomName: string | null;
  bedNumbers: string[];
  totalAmount: number;
  createdAt: string;
}

export class ContractService {
  static async getAll(): Promise<ContractAdminRow[]> {
    const res = await ApiClient.get('/contracts/admin/all');
    return res.data;
  }

  static async getRentalForms(): Promise<RentalFormOption[]> {
    const res = await ApiClient.get('/contracts/admin/rental-forms');
    return res.data;
  }

  static async create(payload: {
    rentalFormId: string;
    startDate: string;
    stayDuration: number;
  }): Promise<{ id: string }> {
    const res = await ApiClient.post('/contracts/admin', { body: JSON.stringify(payload) });
    return res.data;
  }

  static async update(id: string, payload: { startDate: string; stayDuration: number }): Promise<void> {
    await ApiClient.put(`/contracts/admin/${id}`, { body: JSON.stringify(payload) });
  }

  static async cancel(id: string): Promise<void> {
    await ApiClient.patch(`/contracts/admin/${id}/cancel`);
  }
}
