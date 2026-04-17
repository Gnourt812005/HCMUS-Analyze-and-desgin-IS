import pool from './db';

interface DepositRecord {
  roomId: string;
  idCard: string;
}

export interface RoomBedOption {
  roomId: string;
  bedId: string;
  title: string;
  price: number;
  available: number;
}

export interface RentalRecord {
  registrationId: string;
  roomId: string;
  bedId: string;
  customerName: string;
  idCard: string;
  phone: string;
  email: string;
  rentalMonths: number;
  acceptedConditions: boolean;
  services: { id: string; name: string; price: number; quantity: number }[];
  roomPrice: number;
  serviceTotal: number;
  alreadyDeposited: boolean;
}

export class RentalDB {
  // Lưu session đăng ký trong bộ nhớ — chỉ cần tồn tại trong phiên thanh toán
  private static DEPOSIT_HISTORY: DepositRecord[] = [];
  private static REGISTRATIONS: RentalRecord[] = [];

  static async hasDeposit(roomId: string, idCard: string): Promise<boolean> {
    return this.DEPOSIT_HISTORY.some(d => d.roomId === roomId && d.idCard === idCard);
  }

  static async markDeposited(roomId: string, idCard: string): Promise<void> {
    if (!(await this.hasDeposit(roomId, idCard))) {
      this.DEPOSIT_HISTORY.push({ roomId, idCard });
    }
  }

  // Lấy giá giường từ PostgreSQL (bảng Bed)
  static async getRoomPrice(roomId: string, bedId: string): Promise<number> {
    const { rows } = await pool.query(
      'SELECT baseprice FROM bed WHERE bedid = $1',
      [bedId]
    );
    if (rows.length > 0) return Number(rows[0].baseprice);

    // Fallback: lấy giá trung bình của phòng
    const { rows: fallback } = await pool.query(
      'SELECT AVG(baseprice) AS avg FROM bed WHERE roomid = $1',
      [roomId]
    );
    return fallback[0]?.avg ? Number(fallback[0].avg) : 2200000;
  }

  static async createRegistration(record: RentalRecord): Promise<void> {
    this.REGISTRATIONS.push(record);
  }

  static async getRegistration(registrationId: string): Promise<RentalRecord | null> {
    return this.REGISTRATIONS.find(r => r.registrationId === registrationId) ?? null;
  }
}
