export interface RoomDetailDTO {
  id: string;
  dormId: string;
  name: string;
  block: string;
  tower: string;
  floor: number;
  price: number;
  totalBeds: number;
  availableBeds: number;
  amenities: string[];
  specialNotes: string[];
  imageUrl: string;
  favoriteCount: number;
}