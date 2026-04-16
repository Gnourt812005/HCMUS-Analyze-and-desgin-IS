export class Dorm {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: "Còn phòng" | "Hết phòng" | "Sắp đầy";
  totalRooms: number;
  availableRooms: number;

  constructor(data: Partial<Dorm>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.address = data.address || '';
    this.phone = data.phone || '';
    this.status = data.status || 'Còn phòng';
    this.totalRooms = data.totalRooms || 0;
    this.availableRooms = data.availableRooms || 0;
  }
}
