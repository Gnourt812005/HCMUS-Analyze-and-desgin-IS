import { Dorm } from '../business/Dorm';

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
    },
    {
      id: "2",
      name: "Ký túc xá B",
      address: "456 Đường Lê Văn B, Quận 3, TP.HCM",
      phone: "028 2345 6789",
      status: "Sắp đầy",
      totalRooms: 100,
      availableRooms: 15,
    },
    {
      id: "3",
      name: "Ký túc xá C",
      address: "789 Đường Trần Văn C, Quận 5, TP.HCM",
      phone: "028 3456 7890",
      status: "Còn phòng",
      totalRooms: 150,
      availableRooms: 80,
    },
    {
      id: "4",
      name: "Ký túc xá D",
      address: "321 Đường Phạm Văn D, Quận 7, TP.HCM",
      phone: "028 4567 8901",
      status: "Hết phòng",
      totalRooms: 80,
      availableRooms: 0,
    },
  ];

  static async getAll(): Promise<Partial<Dorm>[]> {
    return this.MOCK_DORMS;
  }
}
