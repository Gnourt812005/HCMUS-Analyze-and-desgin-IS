import { RentalRegistrationRequestDTO } from '@dormarch/shared';
import { dbClient } from './DatabaseClient';

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
  private static DEPOSIT_HISTORY: DepositRecord[] = [];
  private static REGISTRATIONS: RentalRecord[] = [];

  private static async getBedsByRoomId(roomId: string): Promise<Array<{ id: string; roomId: string; bedNumber: string; status: string; price: number }>> {
    const query = `
      SELECT id, room_id, bed_number, status, price
      FROM beds
      WHERE room_id = $1
      ORDER BY bed_number ASC
    `;

    const result = await dbClient.query(query, [roomId]);
    return result.rows.map((row: any) => ({
      id: row.id,
      roomId: row.room_id,
      bedNumber: row.bed_number,
      status: row.status,
      price: Number(row.price || 0)
    }));
  }

  private static async syncRoomAvailableBeds(roomId: string): Promise<void> {
    const result = await dbClient.query(
      `SELECT COUNT(*)::int AS available_beds FROM beds WHERE room_id = $1 AND status = 'AVAILABLE'`,
      [roomId]
    );

    await dbClient.query(
      `UPDATE rooms SET available_beds = $1 WHERE id = $2`,
      [Number(result.rows[0]?.available_beds || 0), roomId]
    );
  }

  static async hasDeposit(roomId: string, idCard: string, bedIds?: string[]): Promise<boolean> {
    const roomBeds = await this.getBedsByRoomId(roomId);
    const targetBeds = bedIds && bedIds.length > 0 ? bedIds : roomBeds.map(bed => bed.id);

    return this.DEPOSIT_HISTORY.some(
      item => targetBeds.includes(item.bedId) && item.idCard === idCard
    );
  }

  static async listRoomBedsByDorm(dormId: string): Promise<RoomBedOption[]> {
    const query = `
      SELECT
        r.id AS room_id,
        b.id AS bed_id,
        b.bed_number,
        b.status,
        b.price
      FROM rooms r
      JOIN beds b ON b.room_id = r.id
      WHERE r.dorm_id = $1
      ORDER BY r.name ASC, b.bed_number ASC
    `;

    const result = await dbClient.query(query, [dormId]);

    return result.rows.map((row: any) => {
      const isDepositedBySomeone = this.DEPOSIT_HISTORY.some(item => item.bedId === row.bed_id);
      return {
        roomId: row.room_id,
        bedId: row.bed_id,
        title: `Phòng ${row.room_id} - Giường ${row.bed_number}`,
        price: Number(row.price || 0),
        available: !isDepositedBySomeone && row.status === 'AVAILABLE' ? 1 : 0
      };
    });
  }

  static async areBedsAvailable(roomId: string, bedIds: string[]): Promise<boolean> {
    if (bedIds.length === 0) return false;

    const query = `
      SELECT id, status
      FROM beds
      WHERE room_id = $1 AND id = ANY($2::uuid[])
    `;

    const result = await dbClient.query(query, [roomId, bedIds]);
    if (result.rows.length !== bedIds.length) return false;

    return result.rows.every((row: any) => row.status === 'AVAILABLE');
  }

  static async getBedsTotalPrice(roomId: string, bedIds: string[]): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(price), 0) AS total_price
      FROM beds
      WHERE room_id = $1 AND id = ANY($2::uuid[])
    `;

    const result = await dbClient.query(query, [roomId, bedIds]);
    return Number(result.rows[0]?.total_price || 0);
  }

  static async markDeposited(roomId: string, idCard: string, bedIds: string[]): Promise<void> {
    for (const bedId of bedIds) {
      const exists = this.DEPOSIT_HISTORY.some(
        item => item.bedId === bedId && item.idCard === idCard
      );
      if (!exists) {
        this.DEPOSIT_HISTORY.push({ bedId, idCard });
      }
    }

    await dbClient.query(
      `UPDATE beds SET status = 'DEPOSITED' WHERE room_id = $1 AND id = ANY($2::uuid[])`,
      [roomId, bedIds]
    );

    await this.syncRoomAvailableBeds(roomId);
  }

  static async markBooked(roomId: string, bedIds: string[]): Promise<void> {
    await dbClient.query(
      `UPDATE beds SET status = 'BOOKED' WHERE room_id = $1 AND id = ANY($2::uuid[])`,
      [roomId, bedIds]
    );

    await this.syncRoomAvailableBeds(roomId);
  }

  static async createRegistration(record: RentalRecord): Promise<void> {
    this.REGISTRATIONS.push(record);
  }

  static async getRegistration(registrationId: string): Promise<RentalRecord | null> {
    const found = this.REGISTRATIONS.find(item => item.registrationId === registrationId);
    return found || null;
  }
}
