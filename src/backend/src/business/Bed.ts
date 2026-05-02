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
    const bed = await RoomDB.fetchBedById(bedId);
    if (!bed) {
      throw new Error('Không tìm thấy giường');
    }

    if (bed.status !== 'AVAILABLE') {
      throw new Error('Không thể xóa giường này vì trạng thái không phải là "Sẵn sàng" (AVAILABLE).');
    }

    const success = await RoomDB.removeBed(bedId);
    if (success) {
      await RoomDB.syncRoomAvailability(bed.roomId);
    }
    return success;
  }

}
