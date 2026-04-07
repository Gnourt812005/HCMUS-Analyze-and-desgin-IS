import { User } from '../business/User';

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
      address: 'Quận 1, TP.HCM'
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
