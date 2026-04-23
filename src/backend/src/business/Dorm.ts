import { DormDTO, CreateDormDTO, UpdateDormDTO } from '@dormarch/shared';
import { DormDB } from '../database/DormDB';

export class Dorm {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: "Còn phòng" | "Hết phòng" | "Sắp đầy" | "Đã ẩn";
  totalRooms: number;
  availableRooms: number;
  managerId: string;

  constructor(data: Partial<Dorm>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.address = data.address || '';
    this.phone = data.phone || '';
    this.status = data.status || 'Còn phòng';
    this.totalRooms = data.totalRooms || 0;
    this.availableRooms = data.availableRooms || 0;
    this.managerId = data.managerId || '';
  }

  toDTO(): DormDTO {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      phone: this.phone,
      status: this.status,
      totalRooms: this.totalRooms,
      availableRooms: this.availableRooms,
      managerId: this.managerId
    };
  }

  static async getAll(keyword?: string): Promise<DormDTO[]> {
    let dorms: Dorm[];
    if (keyword) {
      dorms = await DormDB.fetchByKeyword(keyword);
    } else {
      dorms = await DormDB.getAll();
    }
    return dorms.map(d => d.toDTO());
  }

  static async getById(id: string): Promise<DormDTO | null> {
    const dorm = await DormDB.fetchById(id);
    return dorm ? dorm.toDTO() : null;
  }

  static async create(data: CreateDormDTO): Promise<boolean> {
    // Basic validation could go here
    const newDorm = new Dorm({
      ...data,
      status: 'Còn phòng',
      availableRooms: data.totalRooms
    });
    return await DormDB.insert(newDorm);
  }

  static async update(id: string, data: UpdateDormDTO): Promise<boolean> {
    const exists = await DormDB.fetchById(id);
    if (!exists) {
      throw new Error('Không tìm thấy ký túc xá');
    }
    return await DormDB.update(id, data);
  }

  static async delete(id: string): Promise<boolean> {
    const exists = await DormDB.fetchById(id);
    if (!exists) {
      throw new Error('Không tìm thấy ký túc xá');
    }
    return await DormDB.delete(id);
  }
}
