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
    return this.MOCK_RECORDS.filter(r => r.userId === userId).map(r => r.roomId);
  }

  static async insert(userId: string, roomId: string): Promise<boolean> {
    // Prevent duplicate favorites
    const existing = this.MOCK_RECORDS.find(r => r.userId === userId && r.roomId === roomId);
    if (existing) {
        return false;
    }
    this.MOCK_RECORDS.push(new FavouriteRooms(userId, roomId));
    return true;
  }

  static async delete(userId: string, roomId: string): Promise<boolean> {
    const initialLength = this.MOCK_RECORDS.length;
    this.MOCK_RECORDS = this.MOCK_RECORDS.filter(r => !(r.userId === userId && r.roomId === roomId));
    return this.MOCK_RECORDS.length < initialLength;
  }
}
