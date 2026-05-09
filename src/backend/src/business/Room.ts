import { RoomDTO, CreateRoomDTO, UpdateRoomDTO, GetRoomDto, BedDTO } from '@dormarch/shared';
import { RoomDB } from '../database/RoomDB';

export class Room {
  id: string;
  dormId: string;
  name: string;
  block: string;
  floor: number;
  price: number;
  totalBeds: number;
  availableBeds: number;
  amenities: string[];
  status: string;
  imageUrl: string;
  favoriteCount: number;
  hasUserDeposit?: boolean;
  userRegistrationId?: string;
  beds?: BedDTO[];
  utilities?: { id: string, title: string, status: string }[];
  utilityIds?: string[];

  constructor(data: any) {
    this.id = data.id || '';
    this.dormId = data.dormId || data.dorm_id || '';
    this.name = data.name || '';
    this.block = data.block || '';
    this.floor = data.floor || 0;
    this.price = data.price || data.lowest_price || 0;
    this.totalBeds = data.totalBeds || data.total_beds || 0;
    this.availableBeds = data.availableBeds || data.available_beds || 0;
    this.amenities = data.amenities || data.room_utilities || [];
    this.utilities = data.utilities || data.room_utilities_details || [];
    this.status = data.status || 'AVAILABLE';
    this.imageUrl = data.imageUrl || data.image_url || '';
    this.favoriteCount = data.favoriteCount || data.favorite_count || 0;
    this.utilityIds = data.utilityIds || data.utility_ids || [];
    this.hasUserDeposit = data.hasUserDeposit || false;
    this.userRegistrationId = data.userRegistrationId || '';
    this.beds = data.beds || [];
  }

  static async fetchAll(query: GetRoomDto): Promise<{ rooms: RoomDTO[], total: number }> {
    return await RoomDB.fetchAll(query);
  }
  static async getByDormId(dormId: string): Promise<RoomDTO[]> {
    const data = await RoomDB.getByDormId(dormId);
    return data.map(d => new Room(d).toDTO());
  }

  static async getById(id: string): Promise<RoomDTO | null> {
    const data = await RoomDB.fetchById(id);
    if (!data) return null;
    return new Room(data).toDTO();
  }

  static async create(data: CreateRoomDTO): Promise<boolean> {
    return await RoomDB.insert(data);
  }

  static async update(id: string, data: UpdateRoomDTO): Promise<boolean> {
    return await RoomDB.update(id, data);
  }

  static async delete(id: string): Promise<boolean> {
    const room = await this.getById(id);
    if (!room) {
      throw new Error('Không tìm thấy phòng');
    }

    // Check if all beds inside are AVAILABLE
    const occupiedBeds = (room.beds || []).filter(b => b.status !== 'AVAILABLE');
    if (occupiedBeds.length > 0) {
      throw new Error('Không thể xóa phòng này vì vẫn còn giường đang có người ở hoặc được đặt.');
    }

    // Delete all beds inside
    await this.deleteBedsByRoomId(id);

    return await RoomDB.delete(id);
  }

  static async deleteBedsByRoomId(roomId: string): Promise<boolean> {
    return await RoomDB.deleteBedsByRoomId(roomId);
  }


  static async deleteByDormId(dormId: string): Promise<boolean> {
    return await RoomDB.deleteByDormId(dormId);
  }

  static async updateBedStatus(roomId: string, bedIds: string[], status: 'AVAILABLE' | 'DEPOSITED' | 'BOOKED'): Promise<boolean> {
    return await RoomDB.markBedsStatus(roomId, bedIds, status);
  }

  static async getBedsByRoomId(roomId: string): Promise<BedDTO[]> { 
    return await RoomDB.getBedsByRoomId(roomId);
  }

  toDTO(): RoomDTO {
    return {
      id: this.id,
      dormId: this.dormId,
      name: this.name,
      block: this.block,
      floor: this.floor,
      price: this.price,
      totalBeds: this.totalBeds,
      availableBeds: this.availableBeds,
      amenities: this.amenities,
      status: this.status,
      hasUserDeposit: this.hasUserDeposit,
      userRegistrationId: this.userRegistrationId,
      beds: this.beds,
      utilities: this.utilities,
      utilityIds: this.utilityIds
    };
  }
}
