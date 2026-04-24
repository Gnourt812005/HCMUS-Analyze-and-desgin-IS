import { HandoverDB, CreateHandoverBed, EquipmentStatus, HandoverType } from '../database/HandoverDB';

export class Handover {
  static async getAll() {
    return HandoverDB.getAll();
  }

  static async getById(id: string) {
    return HandoverDB.getById(id);
  }

  static async getActiveContracts() {
    return HandoverDB.getActiveContracts();
  }

  static async create(data: {
    contractId: string;
    type: HandoverType;
    beds: CreateHandoverBed[];
    note: string;
  }) {
    if (!data.contractId) throw new Error('contractId là bắt buộc');
    if (!data.beds || data.beds.length === 0) throw new Error('Phải có ít nhất 1 giường');
    return HandoverDB.insert(data.contractId, data.type, data.beds, data.note || '');
  }
}
