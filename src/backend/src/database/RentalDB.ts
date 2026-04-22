import { RentalRegistrationRequestDTO } from '@dormarch/shared';

interface BedRecord {
  roomId: string;
  bedId: string;
  price: number;
  status: 'AVAILABLE' | 'DEPOSITED' | 'BOOKED';
}

export interface RoomBedOption {
  roomId: string;
  bedId: string;
  title: string;
  price: number;
  available: number;
}

interface DepositRecord {
  bedId: string;
  idCard: string;
}

export interface RentalRecord extends RentalRegistrationRequestDTO {
  registrationId: string;
  roomPrice: number;
  alreadyDeposited: boolean;
}

export class RentalDB {
  private static ROOM_DORM_MAP: Record<string, string> = {
    '101': '1',
    '102': '1',
    '201': '1',
    '301': '1',
    '302': '1',
    '401': '1'
  };

  private static BED_DATA: BedRecord[] = [
    { roomId: '101', bedId: '101-B1', price: 1500000, status: 'AVAILABLE' },
    { roomId: '101', bedId: '101-B2', price: 1500000, status: 'AVAILABLE' },
    { roomId: '101', bedId: '101-B3', price: 1500000, status: 'BOOKED' },
    { roomId: '101', bedId: '101-B4', price: 1500000, status: 'BOOKED' },
    { roomId: '102', bedId: '102-B1', price: 2000000, status: 'AVAILABLE' },
    { roomId: '102', bedId: '102-B2', price: 2000000, status: 'BOOKED' },
    { roomId: '201', bedId: '201-B1', price: 1800000, status: 'AVAILABLE' },
    { roomId: '201', bedId: '201-B2', price: 1800000, status: 'AVAILABLE' },
    { roomId: '201', bedId: '201-B3', price: 1800000, status: 'AVAILABLE' },
    { roomId: '201', bedId: '201-B4', price: 1800000, status: 'BOOKED' },
    { roomId: '301', bedId: '301-B1', price: 1200000, status: 'AVAILABLE' },
    { roomId: '301', bedId: '301-B2', price: 1200000, status: 'AVAILABLE' },
    { roomId: '301', bedId: '301-B3', price: 1200000, status: 'AVAILABLE' },
    { roomId: '301', bedId: '301-B4', price: 1200000, status: 'AVAILABLE' },
    { roomId: '301', bedId: '301-B5', price: 1200000, status: 'BOOKED' },
    { roomId: '301', bedId: '301-B6', price: 1200000, status: 'BOOKED' },
    { roomId: '302', bedId: '302-B1', price: 2500000, status: 'BOOKED' },
    { roomId: '302', bedId: '302-B2', price: 2500000, status: 'BOOKED' },
    { roomId: '401', bedId: '401-B1', price: 1600000, status: 'AVAILABLE' },
    { roomId: '401', bedId: '401-B2', price: 1600000, status: 'AVAILABLE' },
    { roomId: '401', bedId: '401-B3', price: 1600000, status: 'AVAILABLE' },
    { roomId: '401', bedId: '401-B4', price: 1600000, status: 'AVAILABLE' }
  ];

  private static DEPOSIT_HISTORY: DepositRecord[] = [];
  private static REGISTRATIONS: RentalRecord[] = [];

  static async hasDeposit(roomId: string, idCard: string, bedIds?: string[]): Promise<boolean> {
    const roomBeds = this.BED_DATA.filter(bed => bed.roomId === roomId).map(bed => bed.bedId);
    const targetBeds = bedIds && bedIds.length > 0 ? bedIds : roomBeds;

    return this.DEPOSIT_HISTORY.some(
      item => targetBeds.includes(item.bedId) && item.idCard === idCard
    );
  }

  static async listRoomBedsByDorm(dormId: string): Promise<RoomBedOption[]> {
    const beds = this.BED_DATA.filter(bed => this.ROOM_DORM_MAP[bed.roomId] === dormId);

    return beds.map(bed => {
      const isDepositedBySomeone = this.DEPOSIT_HISTORY.some(item => item.bedId === bed.bedId);
      return {
        roomId: bed.roomId,
        bedId: bed.bedId,
        title: `Phòng ${bed.roomId} - Giường ${bed.bedId}`,
        price: bed.price,
        available: !isDepositedBySomeone && bed.status === 'AVAILABLE' ? 1 : 0
      };
    });
  }

  static async areBedsAvailable(roomId: string, bedIds: string[]): Promise<boolean> {
    if (bedIds.length === 0) return false;

    const selected = this.BED_DATA.filter(bed => bed.roomId === roomId && bedIds.includes(bed.bedId));
    if (selected.length !== bedIds.length) return false;

    return selected.every(bed => {
      const depositedBySomeone = this.DEPOSIT_HISTORY.some(item => item.bedId === bed.bedId);
      return bed.status === 'AVAILABLE' && !depositedBySomeone;
    });
  }

  static async getBedsTotalPrice(roomId: string, bedIds: string[]): Promise<number> {
    const selected = this.BED_DATA.filter(bed => bed.roomId === roomId && bedIds.includes(bed.bedId));
    return selected.reduce((sum, bed) => sum + bed.price, 0);
  }

  static async markDeposited(roomId: string, idCard: string, bedIds: string[]): Promise<void> {
    for (const bedId of bedIds) {
      const exists = this.DEPOSIT_HISTORY.some(
        item => item.bedId === bedId && item.idCard === idCard
      );
      if (!exists) {
        this.DEPOSIT_HISTORY.push({ bedId, idCard });
      }

      const bed = this.BED_DATA.find(item => item.roomId === roomId && item.bedId === bedId);
      if (bed && bed.status === 'AVAILABLE') {
        bed.status = 'DEPOSITED';
      }
    }
  }

  static async createRegistration(record: RentalRecord): Promise<void> {
    this.REGISTRATIONS.push(record);
  }

  static async getRegistration(registrationId: string): Promise<RentalRecord | null> {
    const found = this.REGISTRATIONS.find(item => item.registrationId === registrationId);
    return found || null;
  }
}
