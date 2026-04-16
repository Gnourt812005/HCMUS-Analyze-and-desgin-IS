import { RentalRegistrationRequestDTO } from '@dormarch/shared';

interface RoomRecord {
  dormId: string;
  roomId: string;
  bedId: string;
  price: number;
}

export interface RoomBedOption {
  roomId: string;
  bedId: string;
  title: string;
  price: number;
  available: number;
}

interface DepositRecord {
  roomId: string;
  idCard: string;
}

export interface RentalRecord extends RentalRegistrationRequestDTO {
  registrationId: string;
  roomPrice: number;
  serviceTotal: number;
  alreadyDeposited: boolean;
}

export class RentalDB {
  private static ROOM_DATA: RoomRecord[] = [
    { dormId: '1', roomId: 'R101', bedId: 'B1', price: 2500000 },
    { dormId: '1', roomId: 'R101', bedId: 'B2', price: 2500000 },
    { dormId: '1', roomId: 'R102', bedId: 'B1', price: 2300000 },
    { dormId: '1', roomId: 'R102', bedId: 'B2', price: 2300000 },
    { dormId: '2', roomId: 'R201', bedId: 'B1', price: 2700000 },
    { dormId: '2', roomId: 'R201', bedId: 'B2', price: 2700000 },
    { dormId: '3', roomId: 'R301', bedId: 'B1', price: 2100000 },
    { dormId: '3', roomId: 'R301', bedId: 'B2', price: 2100000 }
  ];

  private static DEPOSIT_HISTORY: DepositRecord[] = [];
  private static REGISTRATIONS: RentalRecord[] = [];

  static async hasDeposit(roomId: string, idCard: string): Promise<boolean> {
    return this.DEPOSIT_HISTORY.some(item => item.roomId === roomId && item.idCard === idCard);
  }

  static async listRoomBedsByDorm(dormId: string): Promise<RoomBedOption[]> {
    const rooms = this.ROOM_DATA.filter(room => room.dormId === dormId);

    return rooms.map(room => {
      const isDepositedBySomeone = this.DEPOSIT_HISTORY.some(item => item.roomId === room.roomId);
      return {
        roomId: room.roomId,
        bedId: room.bedId,
        title: `Phòng ${room.roomId} - Giường ${room.bedId}`,
        price: room.price,
        available: isDepositedBySomeone ? 0 : 1
      };
    });
  }

  static async markDeposited(roomId: string, idCard: string): Promise<void> {
    const exists = await this.hasDeposit(roomId, idCard);
    if (!exists) {
      this.DEPOSIT_HISTORY.push({ roomId, idCard });
    }
  }

  static async getRoomPrice(roomId: string, bedId: string): Promise<number> {
    const exact = this.ROOM_DATA.find(room => room.roomId === roomId && room.bedId === bedId);
    if (exact) return exact.price;

    const byRoom = this.ROOM_DATA.find(room => room.roomId === roomId);
    return byRoom?.price || 2200000;
  }

  static async createRegistration(record: RentalRecord): Promise<void> {
    this.REGISTRATIONS.push(record);
  }

  static async getRegistration(registrationId: string): Promise<RentalRecord | null> {
    const found = this.REGISTRATIONS.find(item => item.registrationId === registrationId);
    return found || null;
  }
}
