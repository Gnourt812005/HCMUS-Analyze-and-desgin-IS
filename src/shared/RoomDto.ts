export interface RoomViewDTO {
  id: string;
  name: string;
  block: string;
  price: number;
  totalBeds: number;
  availableBeds: number;
  amenities: string[];
  imageUrl: string;
}

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