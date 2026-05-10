import { User } from '../business/User';
import { UserRole, UpdateProfileDTO } from '@dormarch/shared';
import { DatabaseClient } from './DatabaseClient';

export class UserDB {
  private static mapRowToUser(row: any): User {
    return new User({
      email: row.email,
      fullName: row.full_name,
      password: row.password,
      cccd: row.cccd,
      birthday: row.birthday ? new Date(row.birthday).toISOString().split('T')[0] : undefined,
      gender: row.gender,
      phone: row.phone,
      address: row.address,
      role: row.role as UserRole,
      dormId: row.dorm_id
    });
  }

  static async fetchCredentialByEmail(email: string): Promise<User | null> {
    const db = DatabaseClient.getInstance();
    const query = 'SELECT * FROM users WHERE email = $1';
    try {
      const result = await db.query(query, [email]);
      if (result.rows.length === 0) return null;
      return this.mapRowToUser(result.rows[0]);
    } catch (e) {
      console.error('Database fetch failed (UserDB.fetchCredentialByEmail):', e);
      return null;
    }
  }

  static async fetchEmployeesByRole(role: UserRole | string): Promise<User[]> {
    const db = DatabaseClient.getInstance();
    const query = 'SELECT * FROM users WHERE role = $1';
    try {
      const result = await db.query(query, [role]);
      return result.rows.map(this.mapRowToUser.bind(this));
    } catch (e) {
      console.error('Database fetch failed (UserDB.fetchEmployeesByRole):', e);
      return [];
    }
  }

  static async fetchAllStaff(filter: { keyword?: string } = {}): Promise<User[]> {
    const db = DatabaseClient.getInstance();
    let whereClause = "WHERE role != 'GUEST'";
    const values: any[] = [];
    
    if (filter.keyword) {
      whereClause += " AND (full_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)";
      values.push(`%${filter.keyword}%`);
    }

    const query = `SELECT * FROM users ${whereClause} ORDER BY full_name ASC`;
    try {
      const result = await db.query(query, values);
      return result.rows.map(this.mapRowToUser.bind(this));
    } catch (e) {
      console.error('Database fetchAllStaff failed:', e);
      return [];
    }
  }

  static async fetchByCCCD(cccd: string): Promise<User | null> {
    const db = DatabaseClient.getInstance();
    const query = 'SELECT * FROM users WHERE cccd = $1';
    try {
      const result = await db.query(query, [cccd]);
      if (result.rows.length === 0) return null;
      return this.mapRowToUser(result.rows[0]);
    } catch (e) {
      console.error('Database fetch failed (UserDB.fetchByCCCD):', e);
      return null;
    }
  }

  static async checkEmailExists(email: string): Promise<boolean> {
    const db = DatabaseClient.getInstance();
    const query = 'SELECT 1 FROM users WHERE email = $1';
    try {
      const result = await db.query(query, [email]);
      return result.rows.length > 0;
    } catch (e) {
      console.error('Database check failed (UserDB.checkEmailExists):', e);
      return false;
    }
  }

  static async update(email: string, data: UpdateProfileDTO): Promise<boolean> {
    const db = DatabaseClient.getInstance();
    const fields: string[] = [];
    const values: any[] = [];
    let counter = 1;

    if (data.fullName !== undefined) {
      fields.push(`full_name = $${counter++}`);
      values.push(data.fullName);
    }
    if (data.cccd !== undefined) {
      fields.push(`cccd = $${counter++}`);
      values.push(data.cccd);
    }
    if (data.birthday !== undefined) {
      fields.push(`birthday = $${counter++}`);
      values.push(data.birthday);
    }
    if (data.gender !== undefined) {
      fields.push(`gender = $${counter++}`);
      values.push(data.gender);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${counter++}`);
      values.push(data.phone);
    }
    if (data.address !== undefined) {
      fields.push(`address = $${counter++}`);
      values.push(data.address);
    }
    if (data.dormId !== undefined) {
      fields.push(`dorm_id = $${counter++}`);
      values.push(data.dormId || null);
    }

    if (fields.length === 0) return true;

    values.push(email);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE email = $${counter}`;
    try {
      const result = await db.query(query, values);
      return (result.rowCount ?? 0) > 0;
    } catch (e) {
      console.error('Database update failed (UserDB.update):', e);
      return false;
    }
  }

  static async updatePassword(email: string, newPassword: string): Promise<boolean> {
    const db = DatabaseClient.getInstance();
    const query = 'UPDATE users SET password = $1 WHERE email = $2';
    try {
      const result = await db.query(query, [newPassword, email]);
      return (result.rowCount ?? 0) > 0;
    } catch (e) {
      console.error('Database update failed (UserDB.updatePassword):', e);
      return false;
    }
  }

  static async insert(user: User): Promise<boolean> {
    const db = DatabaseClient.getInstance();
    const query = `
      INSERT INTO users (email, password, full_name, cccd, birthday, gender, phone, address, role, dorm_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const values = [
      user.email,
      user.password,
      user.fullName,
      user.cccd || null,
      user.birthday || null,
      user.gender || null,
      user.phone || null,
      user.address || null,
      user.role || UserRole.GUEST,
      user.dormId || null
    ];
    try {
      await db.query(query, values);
      return true;
    } catch (e) {
      console.error('Database insert failed (UserDB.insert):', e);
      return false;
    }
  }

  static async delete(email: string): Promise<boolean> {
    const db = DatabaseClient.getInstance();
    const query = 'DELETE FROM users WHERE email = $1';
    try {
      const result = await db.query(query, [email]);
      return (result.rowCount ?? 0) > 0;
    } catch (e) {
      console.error('Database delete failed (UserDB.delete):', e);
      return false;
    }
  }
}
