export class RoomDB {
  private static MOCK_ROOMS: Array<{ roomId: string; status: string }> = [
    { roomId: 'A101', status: 'OCCUPIED' },
    { roomId: 'B202', status: 'OCCUPIED' }
  ];

  static async getByRoomId(roomId: string): Promise<{ roomId: string; status: string } | null> {
    const room = this.MOCK_ROOMS.find(room => room.roomId === roomId);
    return room || null;
  }

  static async updateStatus(roomId: string, status: string): Promise<boolean> {
    const roomIndex = this.MOCK_ROOMS.findIndex(room => room.roomId === roomId);
    if (roomIndex === -1)
      return false;
    
    this.MOCK_ROOMS[roomIndex].status = status;
    return true;
  }
}
