import { RoomDTO } from '@dormarch/shared';
import { RoomDB } from '../database/RoomDB';

export class Room {
  // Business Layer / Control Class
  static async getAllRooms(): Promise<RoomDTO[]> {
    // Logic for business rules (e.g. filtering, pricing business logic)
    return RoomDB.findMany();
  }
}
