import { Dorm } from '../business/Dorm';
import { DatabaseClient } from './DatabaseClient';

export class DormDB {
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

  private static mapStatusToDB(status: string): string {
    if (status === "Còn phòng") return 'AVAILABLE';
    if (status === "Hết phòng") return 'FULL';
    if (status === "Sắp đầy") return 'NEARLY_FULL';
    return 'AVAILABLE';
  }

  static async getAll(): Promise<Dorm[]> {
    const db = DatabaseClient.getInstance();
    const query = `
      SELECT id, name, address, phone, status, total_rooms, available_rooms, manager_id
      FROM dorms
      ORDER BY name ASC
    `;
    try {
      const result = await db.query(query);
      return result.rows.map(this.mapRowToDorm);
    } catch (e) {
      console.error("Database getAll failed (DormDB.getAll):", e);
      return [];
    }
  }

  static async fetchAll(query: { page?: number, limit?: number, keyword?: string, status?: string }): Promise<{ dorms: Dorm[], total: number }> {
    const db = DatabaseClient.getInstance();
    const { page = 1, limit = 10, keyword, status } = query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let counter = 1;

    if (keyword) {
      whereClause += ` AND (name ILIKE $${counter} OR address ILIKE $${counter})`;
      values.push(`%${keyword}%`);
      counter++;
    }

    if (status) {
      whereClause += ` AND status = $${counter}`;
      values.push(this.mapStatusToDB(status));
      counter++;
    }

    const listQuery = `
      SELECT id, name, address, phone, status, total_rooms, available_rooms, manager_id
      FROM dorms
      ${whereClause}
      ORDER BY name ASC
      LIMIT $${counter++} OFFSET $${counter++}
    `;

    const countQuery = `SELECT COUNT(*) FROM dorms ${whereClause}`;

    try {
      const listResult = await db.query(listQuery, [...values, limit, offset]);
      const countResult = await db.query(countQuery, values);

      return {
        dorms: listResult.rows.map(this.mapRowToDorm),
        total: parseInt(countResult.rows[0].count)
      };
    } catch (e) {
      console.error("Database fetchAll failed (DormDB.fetchAll):", e);
      return { dorms: [], total: 0 };
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
    const db = DatabaseClient.getInstance();
    const query = `
      INSERT INTO dorms (name, address, phone, status, total_rooms, available_rooms, manager_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const values = [
      dorm.name,
      dorm.address,
      dorm.phone,
      this.mapStatusToDB(dorm.status),
      dorm.totalRooms,
      dorm.availableRooms,
      dorm.managerId
    ];
    try {
      await db.query(query, values);
      return true;
    } catch (e) {
      console.error("Database insert failed (DormDB.insert):", e);
      return false;
    }
  }

  static async update(id: string, data: Partial<Dorm>): Promise<boolean> {
    const db = DatabaseClient.getInstance();
    const fields: string[] = [];
    const values: any[] = [];
    let counter = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${counter++}`);
      values.push(data.name);
    }
    if (data.address !== undefined) {
      fields.push(`address = $${counter++}`);
      values.push(data.address);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${counter++}`);
      values.push(data.phone);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${counter++}`);
      values.push(this.mapStatusToDB(data.status));
    }
    if (data.totalRooms !== undefined) {
      fields.push(`total_rooms = $${counter++}`);
      values.push(data.totalRooms);
    }
    if (data.availableRooms !== undefined) {
      fields.push(`available_rooms = $${counter++}`);
      values.push(data.availableRooms);
    }
    if (data.managerId !== undefined) {
      fields.push(`manager_id = $${counter++}`);
      values.push(data.managerId);
    }

    if (fields.length === 0) return true;

    values.push(id);
    const query = `UPDATE dorms SET ${fields.join(', ')} WHERE id = $${counter}`;
    try {
      const result = await db.query(query, values);
      return (result.rowCount ?? 0) > 0;
    } catch (e) {
      console.error("Database update failed (DormDB.update):", e);
      return false;
    }
  }

  static async updateStatus(id: string, status: string): Promise<boolean> {
    return this.update(id, { status: status as any });
  }

  static async delete(id: string): Promise<boolean> {
    const db = DatabaseClient.getInstance();
    const query = `DELETE FROM dorms WHERE id = $1`;
    try {
      const result = await db.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (e) {
      console.error("Database delete failed (DormDB.delete):", e);
      return false;
    }
  }

  static async checkIdExists(id: string): Promise<boolean> {
    const db = DatabaseClient.getInstance();
    const query = `SELECT 1 FROM dorms WHERE id = $1`;
    try {
      const result = await db.query(query, [id]);
      return result.rows.length > 0;
    } catch (e) {
      console.error("Database checkIdExists failed (DormDB.checkIdExists):", e);
      return false;
    }
  }
}
