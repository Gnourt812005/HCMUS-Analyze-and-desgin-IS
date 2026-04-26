import { ApiClient } from './ApiClient';

export type HandoverType = 'IN' | 'OUT';
export type EquipmentStatus = 'Tốt' | 'Hư hỏng' | 'Mất';

export interface HandoverBed {
  bedId: string;
  bedNumber: string;
  bedStatus: EquipmentStatus;
  mattressStatus: EquipmentStatus;
  cabinetStatus: EquipmentStatus;
  keyStatus: EquipmentStatus;
}

export interface HandoverReport {
  id: string;
  contractId: string;
  customerName: string;
  roomName: string;
  type: HandoverType;
  createdAt: string;
  beds: HandoverBed[];
  note: string;
}

export interface ActiveContract {
  contractId: string;
  customerName: string;
  roomName: string;
  beds: { id: string; bedNumber: string }[];
}

export interface CreateHandoverPayload {
  contractId: string;
  type: HandoverType;
  beds: {
    bedId: string;
    bedStatus: EquipmentStatus;
    mattressStatus: EquipmentStatus;
    cabinetStatus: EquipmentStatus;
    keyStatus: EquipmentStatus;
  }[];
  note: string;
}

export class HandoverService {
  static async getAll(): Promise<HandoverReport[]> {
    const res = await ApiClient.get('/handovers');
    return res.data;
  }

  static async getActiveContracts(): Promise<ActiveContract[]> {
    const res = await ApiClient.get('/handovers/active-contracts');
    return res.data;
  }

  static async create(payload: CreateHandoverPayload): Promise<{ id: string }> {
    const res = await ApiClient.post('/handovers', { body: JSON.stringify(payload) });
    return res.data;
  }
}
