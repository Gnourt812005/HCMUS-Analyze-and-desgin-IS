export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  dormId: string;
  dormName: string;
  dormAddress: string;
  date: string;
  time: string;
  salesStaff: {
    name: string;
    phone: string;
  };
  createdAt: Date;
}
