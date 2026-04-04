import { RoomDTO } from '@dormarch/shared';

export class RoomDB {
  // Database Layer / Entity Class
  static async findMany(): Promise<RoomDTO[]> {
    // Logic for actual database queries (SELECT * FROM rooms)
    // For now, this returns seed data
    return [
      {
        id: 'room-102',
        name: 'Căn hộ Studio cao cấp Landmark 81',
        facility: 'Diamond Residence',
        price: 12500000,
        status: 'available',
        images: ['https://placehold.co/600x400/e2e8f0/94a3b8?text=Image'],
        description: 'Phòng studio view sông cực đẹp'
      }
    ];
  }
}
