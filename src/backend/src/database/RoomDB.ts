import { Room } from '../business/Room';

import { BedOptionDTO, RoomDTO, GetRoomDto, CreateRoomDTO, UpdateRoomDTO, BedDTO } from '@dormarch/shared';

import { DatabaseClient } from './DatabaseClient';


const dbClient = DatabaseClient.getInstance();


export class RoomDB {
  public static MOCK_ROOMS: Partial<Room>[] = [
    { id: "101", dormId: "1", name: "A101", block: "Block A", floor: 1, price: 1500000, totalBeds: 4, availableBeds: 2, amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học"], imageUrl: "bedroom-1", favoriteCount: 12 },
    { id: "102", dormId: "1", name: "A102", block: "Block A", floor: 1, price: 2000000, totalBeds: 2, availableBeds: 1, amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học", "Nhà tắm riêng"], imageUrl: "bedroom-2", favoriteCount: 25 },
    { id: "201", dormId: "1", name: "A201", block: "Block A", floor: 2, price: 1800000, totalBeds: 4, availableBeds: 3, amenities: ["Điều hòa", "Wifi", "Bàn học"], imageUrl: "bedroom-3", favoriteCount: 8 },
    { id: "301", dormId: "1", name: "B101", block: "Block B", floor: 1, price: 1200000, totalBeds: 6, availableBeds: 4, amenities: ["Điều hòa", "Wifi"], imageUrl: "bedroom-4", favoriteCount: 5 },
    { id: "302", dormId: "1", name: "B102", block: "Block B", floor: 1, price: 2500000, totalBeds: 2, availableBeds: 0, amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học", "Nhà tắm riêng", "Ban công"], imageUrl: "bedroom-5", favoriteCount: 45 },
    { id: "401", dormId: "1", name: "C101", block: "Block C", floor: 1, price: 1600000, totalBeds: 4, availableBeds: 4, amenities: ["Điều hòa", "Wifi"], imageUrl: "bedroom-6", favoriteCount: 2 }
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
      availableBeds: Number(row.available_beds_live || 0),
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
        r.image_url,
        COALESCE(MIN(b.price), 0) AS "lowest_price",
        COUNT(b.id) FILTER (WHERE b.status = 'AVAILABLE') AS "available_beds_live",
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

  static async getBedsByRoomId(roomId: string): Promise<BedOptionDTO[]> {
    const query = `
      SELECT
        b.id,
        b.room_id,
        b.bed_number,
        b.status,
        b.price
      FROM beds b
      WHERE b.room_id = $1
      ORDER BY b.bed_number ASC
    `;

    try {
      const result = await dbClient.query(query, [roomId]);
      return result.rows.map((row: any) => ({
        id: row.id,
        roomId: row.room_id,
        bedNumber: row.bed_number,
        status: row.status,
        price: Number(row.price || 0)
      }));
    } catch (error) {
      console.error('Error fetching beds by room ID:', error);
      return [];
    }
  }

  static async markBedsStatus(
    roomId: string,
    bedIds: string[],
    status: BedOptionDTO['status']
  ): Promise<boolean> {
    if (bedIds.length === 0) {
      return false;
    }

    try {
      await dbClient.query(
        `UPDATE beds SET status = $1 WHERE room_id = $2 AND id = ANY($3::uuid[])`,
        [status, roomId, bedIds]
      );

      await this.syncRoomAvailability(roomId);
      return true;
    } catch (error) {
      console.error('Error updating bed status:', error);
      return false
    }
  }

  public static async syncRoomAvailability(roomId: string): Promise<void> {
    // 1. Update available_beds in the room
    const bedCountResult = await dbClient.query(
      `SELECT COUNT(*)::int AS available_beds FROM beds WHERE room_id = $1 AND status = 'AVAILABLE'`,
      [roomId]
    );
    const availableBeds = Number(bedCountResult.rows[0]?.available_beds || 0);

    await dbClient.query(
      `UPDATE rooms SET available_beds = $1 WHERE id = $2`,
      [availableBeds, roomId]
    );

    // 2. Update available_rooms in the dorm
    const roomResult = await dbClient.query(
      `SELECT dorm_id FROM rooms WHERE id = $1`,
      [roomId]
    );
    const dormId = roomResult.rows[0]?.dorm_id;

    if (dormId) {
      const availableRoomsResult = await dbClient.query(
        `SELECT COUNT(*)::int AS available_rooms FROM rooms WHERE dorm_id = $1 AND available_beds > 0`,
        [dormId]
      );
      const availableRooms = Number(availableRoomsResult.rows[0]?.available_rooms || 0);

      await dbClient.query(
        `UPDATE dorms SET available_rooms = $1 WHERE id = $2`,
        [availableRooms, dormId]
      );
    }
  }

  // --- NEW IMPLEMENTATION (Room Management UC19) ---

  /**
   * Fetch rooms with pagination, search, and filters
   */
  static async fetchAll(query: GetRoomDto): Promise<{ rooms: RoomDTO[], total: number }> {
    const { page = 1, limit = 10, search, dormId, status, totalBeds } = query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let counter = 1;

    if (dormId) {
      whereClause += ` AND r.dorm_id = $${counter++}`;
      values.push(dormId);
    }
    if (status) {
      whereClause += ` AND r.status = $${counter++}`;
      values.push(status);
    }
    if (totalBeds) {
      whereClause += ` AND r.total_beds = $${counter++}`;
      values.push(totalBeds);
    }
    if (search) {
      whereClause += ` AND (r.name ILIKE $${counter++} OR r.block ILIKE $${counter})`;
      values.push(`%${search}%`);
      counter++;
    }

    const roomsQuery = `
      SELECT 
        r.id, r.dorm_id, r.name, r.block, r.floor, r.status, r.total_beds, r.image_url,
        COALESCE(MIN(b.price), 0) AS "lowest_price",
        COUNT(b.id) FILTER (WHERE b.status = 'AVAILABLE') AS "available_beds_live",
        (SELECT COUNT(*) FROM user_favorite_rooms uf WHERE uf.room_id = r.id) AS "favorite_count",
        COALESCE(
          (SELECT json_agg(u.title) 
           FROM room_utilities ru 
           JOIN utilities u ON ru.utility_id = u.id 
           WHERE ru.room_id = r.id), '[]'
        ) AS "room_utilities"
      FROM rooms r
      LEFT JOIN beds b ON b.room_id = r.id
      ${whereClause}
      GROUP BY r.id
      ORDER BY r.created_at DESC
      LIMIT $${counter++} OFFSET $${counter++}
    `;

    const countQuery = `SELECT COUNT(DISTINCT r.id) FROM rooms r ${whereClause}`;

    try {
      const roomResult = await dbClient.query(roomsQuery, [...values, limit, offset]);
      const countResult = await dbClient.query(countQuery, values);

      let depositedRoomMap = new Map<string, string>();
      if (query.userIdCard) {
        const { RentalDB } = require('./RentalDB');
        depositedRoomMap = await RentalDB.getDepositedRoomMap(query.userIdCard);
      }

      const rooms = roomResult.rows.map((row: any) => ({
        id: row.id,
        dormId: row.dorm_id,
        name: row.name,
        block: row.block,
        floor: row.floor,
        price: Number(row.lowest_price),
        totalBeds: row.total_beds,
        availableBeds: Number(row.available_beds_live || 0),
        amenities: row.room_utilities,
        favoriteCount: Number(row.favorite_count || 0),
        status: row.status,
        hasUserDeposit: depositedRoomMap.has(row.id),
        userRegistrationId: depositedRoomMap.get(row.id)
      }));

      return {
        rooms,
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      console.error("Error in RoomDB.fetchAll:", error);
      return { rooms: [], total: 0 };
    }
  }

  static async fetchById(id: string): Promise<any | null> {
    const query = `
      SELECT 
        r.id, r.dorm_id, r.name, r.block, r.floor, r.status, r.total_beds, r.image_url,
        (SELECT COUNT(*) FROM beds b_count WHERE b_count.room_id = r.id AND b_count.status = 'AVAILABLE') AS "available_beds_live",
        (SELECT COUNT(*) FROM user_favorite_rooms uf WHERE uf.room_id = r.id) AS "favorite_count",
        COALESCE(
          (SELECT json_agg(json_build_object('id', u.id, 'title', u.title, 'status', ru.status)) 
           FROM room_utilities ru 
           JOIN utilities u ON ru.utility_id = u.id 
           WHERE ru.room_id = r.id), '[]'
        ) AS "room_utilities_details",
        COALESCE(
          (SELECT json_agg(u.id) 
           FROM room_utilities ru 
           JOIN utilities u ON ru.utility_id = u.id 
           WHERE ru.room_id = r.id), '[]'
        ) AS "utility_ids",
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', b.id,
            'roomId', b.room_id,
            'bedNumber', b.bed_number,
            'status', b.status,
            'price', b.price,
            'utilities', (
              SELECT COALESCE(json_agg(json_build_object('id', u.id, 'title', u.title, 'status', bu.status)), '[]')
              FROM bed_utilities bu
              JOIN utilities u ON bu.utility_id = u.id
              WHERE bu.bed_id = b.id
            ),
            'utilityIds', (SELECT COALESCE(json_agg(bu.utility_id), '[]') FROM bed_utilities bu WHERE bu.bed_id = b.id)
          )) FROM beds b WHERE b.room_id = r.id), '[]'
        ) AS "beds"
      FROM rooms r
      LEFT JOIN beds b ON b.room_id = r.id
      WHERE r.id = $1
      GROUP BY r.id
    `;
    try {
      const result = await dbClient.query(query, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error in RoomDB.fetchById:", error);
      return null;
    }
  }

  // No updateFavoriteCount anymore

  static async insert(data: CreateRoomDTO): Promise<boolean> {
    const query = `
      INSERT INTO rooms (dorm_id, name, block, floor, total_beds, available_beds, status)
      VALUES ($1, $2, $3, $4, $5, $5, 'AVAILABLE')
      RETURNING id
    `;
    try {
      const result = await dbClient.query(query, [data.dormId, data.name, data.block, data.floor, data.totalBeds]);
      const newRoomId = result.rows[0].id;

      if (data.utilityIds && data.utilityIds.length > 0) {
        for (const utilId of data.utilityIds) {
          await dbClient.query('INSERT INTO room_utilities (room_id, utility_id) VALUES ($1, $2)', [newRoomId, utilId]);
        }
      }

      return true;
    } catch (error) {
      console.error("Error in RoomDB.insert:", error);
      return false;
    }
  }

  static async update(id: string, data: UpdateRoomDTO): Promise<boolean> {
    const fields = [];
    const values = [];
    let counter = 1;

    if (data.name) { fields.push(`name = $${counter++}`); values.push(data.name); }
    if (data.block) { fields.push(`block = $${counter++}`); values.push(data.block); }
    if (data.floor) { fields.push(`floor = $${counter++}`); values.push(data.floor); }
    if (data.status) { fields.push(`status = $${counter++}`); values.push(data.status); }

    try {
      if (fields.length > 0) {
        values.push(id);
        const query = `UPDATE rooms SET ${fields.join(', ')} WHERE id = $${counter}`;
        await dbClient.query(query, values);
      }

      if (data.utilityIds) {
        // 1. Delete utilities no longer in the list
        if (data.utilityIds.length > 0) {
          const placeholders = data.utilityIds.map((_, i) => `$${i + 2}`).join(', ');
          await dbClient.query(`DELETE FROM room_utilities WHERE room_id = $1 AND utility_id NOT IN (${placeholders})`, [id, ...data.utilityIds]);
        } else {
          await dbClient.query('DELETE FROM room_utilities WHERE room_id = $1', [id]);
        }

        // 2. Upsert new utilities
        if (data.utilityIds.length > 0) {
          for (const utilId of data.utilityIds) {
            await dbClient.query('INSERT INTO room_utilities (room_id, utility_id) VALUES ($1, $2) ON CONFLICT (room_id, utility_id) DO NOTHING', [id, utilId]);
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error in RoomDB.update:", error);
      return false;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await dbClient.query('DELETE FROM rooms WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error("Error in RoomDB.delete:", error);
      return false;
    }
  }

  static async insertBed(data: any): Promise<boolean> {
    const query = `
      INSERT INTO beds (room_id, bed_number, price, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    try {
      const result = await dbClient.query(query, [data.roomId, data.bedNumber, data.price, data.status || 'AVAILABLE']);
      const bedId = result.rows[0].id;

      if (data.utilityIds && data.utilityIds.length > 0) {
        for (const utilId of data.utilityIds) {
          await dbClient.query('INSERT INTO bed_utilities (bed_id, utility_id) VALUES ($1, $2)', [bedId, utilId]);
        }
      }
      return true;
    } catch (error) {
      console.error("Error in RoomDB.insertBed:", error);
      return false;
    }
  }

  static async updateBed(bedId: string, data: any): Promise<boolean> {
    const fields = [];
    const values = [];
    let counter = 1;

    if (data.bedNumber) { fields.push(`bed_number = $${counter++}`); values.push(data.bedNumber); }
    if (data.price) { fields.push(`price = $${counter++}`); values.push(data.price); }
    if (data.status) { fields.push(`status = $${counter++}`); values.push(data.status); }

    try {
      if (fields.length > 0) {
        values.push(bedId);
        const query = `UPDATE beds SET ${fields.join(', ')} WHERE id = $${counter}`;
        await dbClient.query(query, values);
      }

      if (data.utilityIds) {
        // 1. Delete removed utilities
        if (data.utilityIds.length > 0) {
          const placeholders = data.utilityIds.map((_: any, i: any) => `$${i + 2}`).join(', ');
          await dbClient.query(`DELETE FROM bed_utilities WHERE bed_id = $1 AND utility_id NOT IN (${placeholders})`, [bedId, ...data.utilityIds]);
        } else {
          await dbClient.query('DELETE FROM bed_utilities WHERE bed_id = $1', [bedId]);
        }

        // 2. Upsert new utilities
        for (const utilId of data.utilityIds) {
          await dbClient.query('INSERT INTO bed_utilities (bed_id, utility_id) VALUES ($1, $2) ON CONFLICT (bed_id, utility_id) DO NOTHING', [bedId, utilId]);
        }
      }

      return true;
    } catch (error) {
      console.error("Error in RoomDB.updateBed:", error);
      return false;
    }
  }

  static async removeBed(bedId: string): Promise<boolean> {
    try {
      await dbClient.query('DELETE FROM beds WHERE id = $1', [bedId]);
      return true;
    } catch (error) {
      console.error("Error in RoomDB.removeBed:", error);
      return false;
    }
  }

  static async checkRoomIdExists(dormId: string, name: string): Promise<boolean> {
    try {
      const result = await dbClient.query('SELECT 1 FROM rooms WHERE dorm_id = $1 AND name = $2', [dormId, name]);
      return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }
}
