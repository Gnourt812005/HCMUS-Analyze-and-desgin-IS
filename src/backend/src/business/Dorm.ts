import { DormDTO, CreateDormDTO, UpdateDormDTO, GetDormsDto } from '@dormarch/shared';
import { DormDB } from '../database/DormDB';

export class Dorm {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: "Còn phòng" | "Hết phòng" | "Sắp đầy";
  totalRooms: number;
  availableRooms: number;
  managerId: string;
  utilityIds: string[];
  utilities?: { id: string, title: string, status: string }[];

  constructor(data: Partial<Dorm>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.address = data.address || '';
    this.phone = data.phone || '';
    this.status = data.status || 'Còn phòng';
    this.totalRooms = data.totalRooms || 0;
    this.availableRooms = data.availableRooms || 0;
    this.managerId = data.managerId || '';
    this.utilityIds = data.utilityIds || [];
    this.utilities = (data as any).utilityDetails || [];
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
      managerId: this.managerId,
      utilityIds: this.utilityIds,
      utilities: this.utilities
    };
  }

  static async getAll(query: GetDormsDto): Promise<{ dorms: DormDTO[], total: number }> {
    const { dorms, total } = await DormDB.fetchAll(query);
    return {
      dorms: dorms.map(d => d.toDTO()),
      total
    };
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
    return await DormDB.update(id, data as Partial<Dorm>);
  }

  static async delete(id: string): Promise<boolean> {
    const exists = await DormDB.fetchById(id);
    if (!exists) {
      throw new Error('Không tìm thấy ký túc xá');
    }
    return await DormDB.delete(id);
  }
}
