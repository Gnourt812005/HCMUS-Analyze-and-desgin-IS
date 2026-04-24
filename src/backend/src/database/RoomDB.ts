import { Room } from '../business/Room';

import { BedOptionDTO } from '@dormarch/shared';

import { DatabaseClient } from './DatabaseClient';


const dbClient = DatabaseClient.getInstance();


export class RoomDB {
  public static MOCK_ROOMS: Partial<Room>[] = [
    { id: "101", dormId: "1", name: "A101", block: "Block A", floor: 1, price: 1500000, totalBeds: 4, availableBeds: 2, amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học"], specialNotes: ["Gần thang máy", "Gần bãi giữ xe"], imageUrl: "bedroom-1", favoriteCount: 12 },
    { id: "102", dormId: "1", name: "A102", block: "Block A", floor: 1, price: 2000000, totalBeds: 2, availableBeds: 1, amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học", "Nhà tắm riêng"], specialNotes: ["Nhà tắm riêng", "View đẹp"], imageUrl: "bedroom-2", favoriteCount: 25 },
    { id: "201", dormId: "1", name: "A201", block: "Block A", floor: 2, price: 1800000, totalBeds: 4, availableBeds: 3, amenities: ["Điều hòa", "Wifi", "Bàn học"], specialNotes: ["View công viên"], imageUrl: "bedroom-3", favoriteCount: 8 },
    { id: "301", dormId: "1", name: "B101", block: "Block B", floor: 1, price: 1200000, totalBeds: 6, availableBeds: 4, amenities: ["Điều hòa", "Wifi"], specialNotes: ["Phòng lớn"], imageUrl: "bedroom-4", favoriteCount: 5 },
    { id: "302", dormId: "1", name: "B102", block: "Block B", floor: 1, price: 2500000, totalBeds: 2, availableBeds: 0, amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học", "Nhà tắm riêng", "Ban công"], specialNotes: ["Nhà tắm riêng", "Ban công rộng"], imageUrl: "bedroom-5", favoriteCount: 45 },
    { id: "401", dormId: "1", name: "C101", block: "Block C", floor: 1, price: 1600000, totalBeds: 4, availableBeds: 4, amenities: ["Điều hòa", "Wifi"], specialNotes: [], imageUrl: "bedroom-6", favoriteCount: 2 }
  ];

  public static ROOM_BEDS: BedOptionDTO[] = [
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

  private static mapRowToRoom(row: any): Room {
    return new Room({
      id: row.id,
      dormId: row.dorm_id,
      name: row.name,
      block: row.block,
      floor: Number(row.floor || 0),
      price: Number(row.lowest_price || 0),
      totalBeds: Number(row.total_beds || 0),
      availableBeds: Number(row.available_beds || 0),
      amenities: row.room_ultilities || [],
      imageUrl: row.image_url || '',
      favoriteCount: Number(row.favorite_count || 0)
    });
  }

  static async getByDormId(dormId: string): Promise<Partial<Room>[]> {
    const query = `
      SELECT 
        r.id,
        r.dorm_id,
        r.name,
        r.block,
        r.floor,
        r.status,
        r.total_beds,
        r.available_beds,
        r.image_url,
        COALESCE(MIN(b.price), 0) AS "lowest_price",
        COALESCE(
          (SELECT json_agg(u.title) 
           FROM room_utilities ru 
           JOIN utilities u ON ru.utility_id = u.id 
           WHERE ru.room_id = r.id), '[]'
        ) AS "room_ultilities",
        (SELECT COUNT(*) FROM user_favorite_rooms uf WHERE uf.room_id = r.id) AS "favorite_count"
      FROM rooms r
      LEFT JOIN beds b ON b.room_id = r.id
      WHERE r.dorm_id = $1
      GROUP BY r.id
    `;
    
    try {
      const result = await dbClient.query(query, [dormId]);
      return result.rows.map(this.mapRowToRoom);
    } catch (error) {
      console.error("Error fetching rooms by dorm ID:", error);
      return [];
    }
  }

  static async getAll(): Promise<Partial<Room>[]> {
    const query = `
      SELECT 
        r.id,
        r.dorm_id,
        r.name,
        r.block,
        r.floor,
        r.total_beds,
        r.available_beds,
        r.image_url,
        COALESCE(MIN(b.price), 0) AS "lowest_price",
        COALESCE(
          (SELECT json_agg(u.title) 
           FROM room_utilities ru 
           JOIN utilities u ON ru.utility_id = u.id 
           WHERE ru.room_id = r.id), '[]'
        ) AS "room_ultilities",
        (SELECT COUNT(*) FROM user_favorite_rooms uf WHERE uf.room_id = r.id) AS "favorite_count"
      FROM rooms r
      LEFT JOIN beds b ON b.room_id = r.id
      GROUP BY r.id
    `;
    
    try {
      const result = await dbClient.query(query);
      return result.rows.map(this.mapRowToRoom);
    } catch (error) {
      console.error("Error fetching all rooms:", error);
      return [];
    }
  }

  static async getBedsByRoomId(roomId: string): Promise<BedOptionDTO[]> {
    return this.ROOM_BEDS.filter(bed => bed.roomId === roomId);
  }

  static async markBedsStatus(
    roomId: string,
    bedIds: string[],
    status: BedOptionDTO['status']
  ): Promise<void> {
    this.ROOM_BEDS = this.ROOM_BEDS.map((bed) => {
      if (bed.roomId === roomId && bedIds.includes(bed.id)) {
        return { ...bed, status };
      }
      return bed;
    });

    const room = this.MOCK_ROOMS.find((item) => item.id === roomId);
    if (room) {
      const availableBeds = this.ROOM_BEDS.filter(
        (bed) => bed.roomId === roomId && bed.status === 'AVAILABLE'
      ).length;
      room.availableBeds = availableBeds;
    }
  }
}
