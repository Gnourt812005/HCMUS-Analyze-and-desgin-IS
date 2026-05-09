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
      managerId: row.manager_id,
      utilityIds: row.utility_ids || []
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

      // Fetch utilities with status separately
      const utilQuery = `
        SELECT u.id, u.title, du.status 
        FROM dorm_utilities du 
        JOIN utilities u ON du.utility_id = u.id 
        WHERE du.dorm_id = $1
      `;
      const utilResult = await db.query(utilQuery, [id]);
      const utilityDetails = utilResult.rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        status: r.status
      }));
      const utilityIds = utilityDetails.map((u: any) => u.id);

      return this.mapRowToDorm({ ...result.rows[0], utility_ids: utilityIds, utilityDetails });
    }
    catch (e) {
      console.error("Database fetch failed:", e);
      return null;
    }
  }

  static async insert(dorm: Dorm): Promise<string | null> {
    const db = DatabaseClient.getInstance();
    const query = `
      INSERT INTO dorms (name, address, phone, status, total_rooms, available_rooms, manager_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
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
      const result = await db.query(query, values);
      const newId = result.rows[0].id;

      // sync utilities
      if (dorm.utilityIds && dorm.utilityIds.length > 0) {
        const utilValues = dorm.utilityIds.map(uid => `('${newId}', '${uid}')`).join(',');
        const utilSyncQuery = `
          INSERT INTO dorm_utilities (dorm_id, utility_id)
          VALUES ${utilValues}
          ON CONFLICT (dorm_id, utility_id) DO NOTHING
        `;
        await db.query(utilSyncQuery);
      }

      return newId;
    } catch (e) {
      console.error("Database insert failed (DormDB.insert):", e);
      return null;
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

    try {
      if (fields.length > 0) {
        values.push(id);
        const query = `UPDATE dorms SET ${fields.join(', ')} WHERE id = $${counter}`;
        await db.query(query, values);
      }

      // Sync utilities if provided
      if (data.utilityIds !== undefined) {
        // 1. Delete utilities no longer in the list
        if (data.utilityIds.length === 0) {
          await db.query(`DELETE FROM dorm_utilities WHERE dorm_id = $1`, [id]);
        } else {
          const placeholders = data.utilityIds.map((_, i) => `$${i + 2}`).join(',');
          await db.query(
            `DELETE FROM dorm_utilities WHERE dorm_id = $1 AND utility_id NOT IN (${placeholders})`,
            [id, ...data.utilityIds]
          );

          // 2. Insert new utilities (ignore duplicates)
          const utilValues = data.utilityIds.map(uid => `('${id}', '${uid}')`).join(',');
          const utilSyncQuery = `
            INSERT INTO dorm_utilities (dorm_id, utility_id)
            VALUES ${utilValues}
            ON CONFLICT (dorm_id, utility_id) DO NOTHING
          `;
          await db.query(utilSyncQuery);
        }
      }

      return true;
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
