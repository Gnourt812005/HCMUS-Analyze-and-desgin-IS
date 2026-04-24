import { Dorm } from '../business/Dorm';
import { DatabaseClient } from './DatabaseClient';

export class DormDB {
  private static MOCK_DORMS: Partial<Dorm>[] = [
    {
      id: "1",
      name: "Ký túc xá A",
      address: "123 Đường Nguyễn Văn A, Quận 1, TP.HCM",
      phone: "028 1234 5678",
      status: "Còn phòng",
      totalRooms: 120,
      availableRooms: 45,
      managerId: "staff@gmail.com"
    },
    {
      id: "2",
      name: "Ký túc xá B",
      address: "456 Đường Lê Văn B, Quận 3, TP.HCM",
      phone: "028 2345 6789",
      status: "Sắp đầy",
      totalRooms: 100,
      availableRooms: 15,
      managerId: "staff2@gmail.com"
    },
    {
      id: "3",
      name: "Ký túc xá C",
      address: "789 Đường Trần Văn C, Quận 5, TP.HCM",
      phone: "028 3456 7890",
      status: "Còn phòng",
      totalRooms: 150,
      availableRooms: 80,
      managerId: "staff@gmail.com"
    },
    {
      id: "4",
      name: "Ký túc xá D",
      address: "321 Đường Phạm Văn D, Quận 7, TP.HCM",
      phone: "028 4567 8901",
      status: "Hết phòng",
      totalRooms: 80,
      availableRooms: 0,
      managerId: "staff2@gmail.com"
    },
  ];

  private static mapRowToDorm(row: any): Dorm {
    let mappedStatus = row.status || "Còn phòng";
    if (row.status === 'AVAILABLE') mappedStatus = "Còn phòng";
    else if (row.status === 'FULL') mappedStatus = "Hết phòng";
    else if (row.status === 'NEARLY_FULL') mappedStatus = "Sắp đầy";

    return new Dorm({
      id: row.id,
      name: row.name,
      address: row.address,
      phone: row.phone,
      status: mappedStatus as any,
      totalRooms: Number(row.total_rooms || 0),
      availableRooms: Number(row.available_rooms || 0),
      managerId: row.manager_id
    });
  }

  static async getAll(): Promise<Dorm[]> {
    const db = DatabaseClient.getInstance();
    const query = `
      SELECT id, name, address, phone, status, total_rooms, available_rooms, manager_id
      FROM dorms
    `;
    try {
    const result = await db.query(query);
    return result.rows.map(this.mapRowToDorm);
    }
    catch (e) {
      console.error("Database fetch failed:", e);
      return [];
    }
  }

  static async fetchByKeyword(keyword: string): Promise<Dorm[]> {
    const db = DatabaseClient.getInstance();
    const query = `
      SELECT id, name, address, phone, status, total_rooms, available_rooms, manager_id
      FROM dorms 
      WHERE name ILIKE $1 OR address ILIKE $1
    `;

    try {
      const result = await db.query(query, [`%${keyword}%`]);
      return result.rows.map(this.mapRowToDorm);
    }
    catch (e) {
      console.error("Database fetch failed:", e);
      return [];
    }
  }

  static async fetchById(id: string): Promise<Dorm | null> {
    const db = DatabaseClient.getInstance();
    const query = `
      SELECT id, name, address, phone, status, total_rooms, available_rooms, manager_id
      FROM dorms 
      WHERE id = $1
    `;
    try {
      const result = await db.query(query, [id]);
      if (result.rows.length === 0) return null;
      return this.mapRowToDorm(result.rows[0]);
    }
    catch (e) {
      console.error("Database fetch failed:", e);
      return null;
    }
  }

  static async insert(dorm: Dorm): Promise<boolean> {
    const newId = (this.MOCK_DORMS.length + 1).toString();
    this.MOCK_DORMS.push({
      ...dorm,
      id: newId
    });
    return true;
  }

  static async update(id: string, data: Partial<Dorm>): Promise<boolean> {
    const index = this.MOCK_DORMS.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.MOCK_DORMS[index] = { ...this.MOCK_DORMS[index], ...data };
    return true;
  }

  static async updateStatus(id: string, status: string): Promise<boolean> {
    const dorm = this.MOCK_DORMS.find(d => d.id === id);
    if (!dorm) return false;
    dorm.status = status as any;
    return true;
  }

  static async delete(id: string): Promise<boolean> {
    const index = this.MOCK_DORMS.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.MOCK_DORMS.splice(index, 1);
    return true;
  }

  static async checkIdExists(id: string): Promise<boolean> {
    return this.MOCK_DORMS.some(d => d.id === id);
  }
}
