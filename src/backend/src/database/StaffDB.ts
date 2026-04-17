import { Staff } from '../business/Staff';

export class StaffDB {
  private static MOCK_STAFFS: Staff[] = [
    new Staff({ staffId: 'staff-1', name: 'Nguyễn Văn Nam', phone: '0901234567', email: 'nam.nv@archdorm.vn' }),
    new Staff({ staffId: 'staff-2', name: 'Trần Thị Thu', phone: '0912345678', email: 'thu.tt@archdorm.vn' })
  ];

  static async getById(staffId: string): Promise<Staff | null> {
    return this.MOCK_STAFFS.find(s => s.staffId === staffId) || null;
  }

  static async getAll(): Promise<Staff[]> {
    return this.MOCK_STAFFS;
  }
}
