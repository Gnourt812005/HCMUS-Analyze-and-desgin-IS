export interface BedDTO {
  id: string;
  roomId: string;
  bedNumber: string;
  status: 'Trống' | 'Đã đặt' | 'Đang ở' | 'Bảo trì';
  price: number;
}
