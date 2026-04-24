import { DatabaseClient } from './DatabaseClient';

export class FavouriteRooms {
  userId: string;
  roomId: string;

  constructor(userId: string, roomId: string) {
    this.userId = userId;
    this.roomId = roomId;
  }
}

export class FavouriteRoomsDB {
  private static MOCK_RECORDS: FavouriteRooms[] = [
    new FavouriteRooms('test@gmail.com', '101'),
    new FavouriteRooms('test@gmail.com', '102'),
    new FavouriteRooms('test2@gmail.com', '103'),
  ];

  static async getRoomIdsByUserId(userId: string): Promise<string[]> {
    try {
      const result = await DatabaseClient.getInstance().query(
        `SELECT room_id FROM user_favorite_rooms WHERE user_email = $1`,
        [userId]
      );
      
      // If DB fails or is empty, can fallback to mock if you want, but user wants actual DB fetching
      // we'll return DB results
      if (result.rows.length > 0) {
        return result.rows.map((r: any) => r.room_id);
      }
      return [];
    } catch (e) {
      console.error("Could not fetch favorites from database:", e);
      return [];
    }
  }

  static async insert(userId: string, roomId: string): Promise<boolean> {
    // Prevent duplicate favorites
    const isDuplicate = await DatabaseClient.getInstance().query('SELECT 1 FROM user_favorite_rooms WHERE user_email = $1 AND room_id = $2', [userId, roomId]);

    if (isDuplicate.rows.length > 0) {
      console.warn(`Favorite already exists for user ${userId} and room ${roomId}`);
      return false;
    }

    const query = `INSERT INTO user_favorite_rooms (user_email, room_id) VALUES ($1, $2)`;
    try {
      await DatabaseClient.getInstance().query(query, [userId, roomId]);
      return true;
    } catch (e) {
      console.error("Failed to insert favorite into database:", e);
      return false;
    }
  }

  static async delete(userId: string, roomId: string): Promise<boolean> {
    const query = `DELETE FROM user_favorite_rooms WHERE user_email = $1 AND room_id = $2`;
    try {
      await DatabaseClient.getInstance().query(query, [userId, roomId]);
      return true;
    } catch (e) {
      console.error("Failed to delete favorite from database:", e);
      return false;
    }
  }
}
