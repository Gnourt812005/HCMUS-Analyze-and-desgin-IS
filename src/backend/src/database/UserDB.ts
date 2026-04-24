import { User } from '../business/User';
import { UserRole } from '@dormarch/shared';
import { dbClient } from './DatabaseClient';

export class UserDB {
  private static mapRow(row: any): Partial<User> {
    return {
      email: row.email,
      password: row.password,
      fullName: row.full_name,
      cccd: row.cccd,
      birthday: row.birthday,
      gender: row.gender,
      phone: row.phone,
      address: row.address,
      role: row.role as UserRole
    };
  }

  static async fetchCredentialByEmail(email: string): Promise<User | null> {
    const sql = `SELECT * FROM users WHERE email = $1 LIMIT 1`;
    const result = await dbClient.query(sql, [email]);
    if (result.rows.length === 0) return null;
    return new User(this.mapRow(result.rows[0]));
  }

  static async fetchByCCCD(cccd: string): Promise<User | null> {
    const sql = `SELECT * FROM users WHERE cccd = $1 LIMIT 1`;
    const result = await dbClient.query(sql, [cccd]);
    if (result.rows.length === 0) return null;
    return new User(this.mapRow(result.rows[0]));
  }

  static async checkEmailExists(email: string): Promise<boolean> {
    const sql = `SELECT 1 FROM users WHERE email = $1 LIMIT 1`;
    const result = await dbClient.query(sql, [email]);
    return (result.rowCount ?? 0) > 0;
  }

  static async update(email: string, data: Partial<User>): Promise<boolean> {
    const sql = `
      UPDATE users
      SET full_name = COALESCE($1, full_name),
          cccd = COALESCE($2, cccd),
          birthday = COALESCE($3, birthday),
          gender = COALESCE($4, gender),
          phone = COALESCE($5, phone),
          address = COALESCE($6, address),
          role = COALESCE($7, role)
      WHERE email = $8
    `;
    const values = [
      data.fullName, data.cccd, data.birthday, data.gender, 
      data.phone, data.address, data.role, email
    ];
    const result = await dbClient.query(sql, values);
    return (result.rowCount ?? 0) > 0;
  }

  static async updatePassword(email: string, newPassword: string): Promise<boolean> {
    const sql = `UPDATE users SET password = $1 WHERE email = $2`;
    const result = await dbClient.query(sql, [newPassword, email]);
    return (result.rowCount ?? 0) > 0;
  }

  static async insert(user: User): Promise<boolean> {
    const sql = `
      INSERT INTO users (email, password, full_name, cccd, birthday, gender, phone, address, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const values = [
      user.email, user.password, user.fullName, user.cccd,
      user.birthday, user.gender, user.phone, user.address, user.role || UserRole.GUEST
    ];
    const result = await dbClient.query(sql, values);
    return (result.rowCount ?? 0) > 0;
  }
}
