export class Staff {
  staffId: string;
  name: string;
  phone: string;
  email: string;

  constructor(data: Partial<Staff>) {
    this.staffId = data.staffId || '';
    this.name = data.name || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
  }
}
