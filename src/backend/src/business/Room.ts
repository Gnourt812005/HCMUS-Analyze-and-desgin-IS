import { RoomDB } from '../database/RoomDB';

export class Room {
  roomId: string;
  status: string;

  constructor(data: Partial<Room>) {
    this.roomId = data.roomId || '';
    this.status = data.status || 'AVAILABLE';
  }

  static async getByRoomId(roomId: string): Promise<Room | null> {
    const roomModel = await RoomDB.getByRoomId(roomId);
    return roomModel ? new Room(roomModel) : null;
  }

  static async updateStatus(roomId: string, status: string): Promise<boolean> {
    return await RoomDB.updateStatus(roomId, status);
  }
}
