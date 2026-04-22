import { Room } from '../business/Room';
import { BedOptionDTO } from '@dormarch/shared';

export class RoomDB {
  private static MOCK_ROOMS: Partial<Room>[] = [
    {
      id: "101",
      dormId: "1",
      name: "A101",
      block: "Block A",
      tower: "Tòa A",
      floor: 1,
      price: 1500000,
      totalBeds: 4,
      availableBeds: 2,
      amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học"],
      specialNotes: ["Gần thang máy", "Gần bãi giữ xe"],
      imageUrl: "bedroom-1",
      favoriteCount: 12,
    },
    {
      id: "102",
      dormId: "1",
      name: "A102",
      block: "Block A",
      tower: "Tòa A",
      floor: 1,
      price: 2000000,
      totalBeds: 2,
      availableBeds: 1,
      amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học", "Nhà tắm riêng"],
      specialNotes: ["Nhà tắm riêng", "View đẹp"],
      imageUrl: "bedroom-2",
      favoriteCount: 25,
    },
    {
      id: "201",
      dormId: "1",
      name: "A201",
      block: "Block A",
      tower: "Tòa A",
      floor: 2,
      price: 1800000,
      totalBeds: 4,
      availableBeds: 3,
      amenities: ["Điều hòa", "Wifi", "Bàn học"],
      specialNotes: ["View công viên"],
      imageUrl: "bedroom-3",
      favoriteCount: 8,
    },
    {
      id: "301",
      dormId: "1",
      name: "B101",
      block: "Block B",
      tower: "Tòa B",
      floor: 1,
      price: 1200000,
      totalBeds: 6,
      availableBeds: 4,
      amenities: ["Điều hòa", "Wifi"],
      specialNotes: ["Phòng lớn"],
      imageUrl: "bedroom-4",
      favoriteCount: 5,
    },
    {
      id: "302",
      dormId: "1",
      name: "B102",
      block: "Block B",
      tower: "Tòa B",
      floor: 1,
      price: 2500000,
      totalBeds: 2,
      availableBeds: 0,
      amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học", "Nhà tắm riêng", "Ban công"],
      specialNotes: ["Nhà tắm riêng", "Ban công rộng"],
      imageUrl: "bedroom-5",
      favoriteCount: 45,
    },
    {
      id: "401",
      dormId: "1",
      name: "C101",
      block: "Block C",
      tower: "Tòa C",
      floor: 1,
      price: 1600000,
      totalBeds: 4,
      availableBeds: 4,
      amenities: ["Điều hòa", "Wifi"],
      specialNotes: [],
      imageUrl: "bedroom-6",
      favoriteCount: 2,
    }
  ];

  private static ROOM_BEDS: BedOptionDTO[] = [
    { id: '101-B1', roomId: '101', bedNumber: 'B1', status: 'AVAILABLE', price: 1500000 },
    { id: '101-B2', roomId: '101', bedNumber: 'B2', status: 'AVAILABLE', price: 1500000 },
    { id: '101-B3', roomId: '101', bedNumber: 'B3', status: 'BOOKED', price: 1500000 },
    { id: '101-B4', roomId: '101', bedNumber: 'B4', status: 'BOOKED', price: 1500000 },
    { id: '102-B1', roomId: '102', bedNumber: 'B1', status: 'AVAILABLE', price: 2000000 },
    { id: '102-B2', roomId: '102', bedNumber: 'B2', status: 'BOOKED', price: 2000000 },
    { id: '201-B1', roomId: '201', bedNumber: 'B1', status: 'AVAILABLE', price: 1800000 },
    { id: '201-B2', roomId: '201', bedNumber: 'B2', status: 'AVAILABLE', price: 1800000 },
    { id: '201-B3', roomId: '201', bedNumber: 'B3', status: 'AVAILABLE', price: 1800000 },
    { id: '201-B4', roomId: '201', bedNumber: 'B4', status: 'BOOKED', price: 1800000 },
    { id: '301-B1', roomId: '301', bedNumber: 'B1', status: 'AVAILABLE', price: 1200000 },
    { id: '301-B2', roomId: '301', bedNumber: 'B2', status: 'AVAILABLE', price: 1200000 },
    { id: '301-B3', roomId: '301', bedNumber: 'B3', status: 'AVAILABLE', price: 1200000 },
    { id: '301-B4', roomId: '301', bedNumber: 'B4', status: 'AVAILABLE', price: 1200000 },
    { id: '301-B5', roomId: '301', bedNumber: 'B5', status: 'BOOKED', price: 1200000 },
    { id: '301-B6', roomId: '301', bedNumber: 'B6', status: 'BOOKED', price: 1200000 },
    { id: '302-B1', roomId: '302', bedNumber: 'B1', status: 'BOOKED', price: 2500000 },
    { id: '302-B2', roomId: '302', bedNumber: 'B2', status: 'BOOKED', price: 2500000 },
    { id: '401-B1', roomId: '401', bedNumber: 'B1', status: 'AVAILABLE', price: 1600000 },
    { id: '401-B2', roomId: '401', bedNumber: 'B2', status: 'AVAILABLE', price: 1600000 },
    { id: '401-B3', roomId: '401', bedNumber: 'B3', status: 'AVAILABLE', price: 1600000 },
    { id: '401-B4', roomId: '401', bedNumber: 'B4', status: 'AVAILABLE', price: 1600000 }
  ];

  static async getByDormId(dormId: string): Promise<Partial<Room>[]> {
    return this.MOCK_ROOMS.filter(r => r.dormId === dormId);
  }

  static async getAll(): Promise<Partial<Room>[]> {
    return this.MOCK_ROOMS;
  }

  static async getBedsByRoomId(roomId: string): Promise<BedOptionDTO[]> {
    return this.ROOM_BEDS.filter(bed => bed.roomId === roomId);
  }
  
  static async toggleFavorite(roomId: string, increment: boolean): Promise<Partial<Room> | null> {
    const idx = this.MOCK_ROOMS.findIndex(r => r.id === roomId);
    if (idx === -1) return null;

    if (increment) {
      if (this.MOCK_ROOMS[idx].favoriteCount !== undefined) {
        this.MOCK_ROOMS[idx].favoriteCount! += 1;
      }
    } else {
      if (this.MOCK_ROOMS[idx].favoriteCount !== undefined && this.MOCK_ROOMS[idx].favoriteCount! > 0) {
        this.MOCK_ROOMS[idx].favoriteCount! -= 1;
      }
    }

    return this.MOCK_ROOMS[idx];
  }
}
