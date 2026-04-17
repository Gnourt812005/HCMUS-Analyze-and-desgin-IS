import { User } from '../business/User';
import { UserRole } from '@dormarch/shared';

export class UserDB {
  private static MOCK_USERS: Partial<User>[] = [
    {
      email: 'test@gmail.com',
      password: 'test@123',
      fullName: 'Tran Van A',
      cccd: '079201012345',
      birthday: '1998-05-15',
      gender: 'Nam',
      phone: '0901234567',
      address: 'Quận 1, TP.HCM',
      role: UserRole.GUEST
    },
    {
      email: 'admin@gmail.com',
      password: 'admin',
      fullName: 'System Admin',
      cccd: '000000000000',
      birthday: '1990-01-01',
      gender: 'Nam',
      phone: '1111111111',
      address: 'Admin address',
      role: UserRole.ADMIN
    },
    {
      email: 'staff@gmail.com',
      password: 'staff@123',
      fullName: 'Sales Staff 1',
      cccd: '079201012345',
      birthday: '1998-05-15',
      gender: 'Nam',
      phone: '0901234567',
      address: 'Quận 1, TP.HCM',
      role: UserRole.SALES_STAFF
    },
    {
      email: 'staff2@gmail.com',
      password: 'staff@123',
      fullName: 'Sales Staff 2',
      cccd: '079201012346',
      birthday: '1995-10-10',
      gender: 'Nữ',
      phone: '0907654321',
      address: 'Quận 3, TP.HCM',
      role: UserRole.SALES_STAFF
    }
  ];

  static async fetchCredentialByEmail(email: string): Promise<User | null> {
    const row = this.MOCK_USERS.find(u => u.email === email);
    if (!row) return null;
    return new User(row);
  }

  static async checkEmailExists(email: string): Promise<boolean> {
    return this.MOCK_USERS.some(u => u.email === email);
  }

  static async update(email: string, data: Partial<User>): Promise<boolean> {
    const userIndex = this.MOCK_USERS.findIndex(u => u.email === email);
    if (userIndex === -1) return false;

    // Spread old data and overwrite with new data
    this.MOCK_USERS[userIndex] = { ...this.MOCK_USERS[userIndex], ...data };
    return true;
  }

  static async updatePassword(email: string, newPassword: string): Promise<boolean> {
    const userIndex = this.MOCK_USERS.findIndex(u => u.email === email);
    if (userIndex === -1) return false;

    this.MOCK_USERS[userIndex].password = newPassword;
    return true;
  }

  static async insert(user: User): Promise<boolean> {
    this.MOCK_USERS.push({
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      cccd: user.cccd,
      birthday: user.birthday,
      gender: user.gender,
      phone: user.phone,
      address: user.address,
    });
    return true;
  }
}
