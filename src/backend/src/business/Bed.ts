import { BedDTO } from '@dormarch/shared';
import { RoomDB } from '../database/RoomDB';

export class Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  status: string;
  price: number;

  constructor(data: Partial<Bed>) {
    this.id = data.id || '';
    this.roomId = data.roomId || '';
    this.bedNumber = data.bedNumber || '';
    this.status = data.status || 'AVAILABLE';
    this.price = data.price || 0;
  }

  static async addBed(roomId: string, data: BedDTO): Promise<boolean> {
    return await RoomDB.insertBed({ ...data, roomId });
  }

  static async updateBed(bedId: string, data: Partial<BedDTO>): Promise<boolean> {
    return await RoomDB.updateBed(bedId, data);
  }

  static async deleteBed(bedId: string): Promise<boolean> {
    return await RoomDB.removeBed(bedId);
  }
}
