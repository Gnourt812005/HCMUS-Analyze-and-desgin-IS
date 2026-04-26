export interface RoomBriefDTO {
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
  floor: number;
  price: number;
  totalBeds: number;
  availableBeds: number;
  amenities: string[];
  // specialNotes: string[];
  imageUrl: string;
  favoriteCount: number;
  isFavorite: boolean;
}

export interface GetRoomDto {
  page?: number;
  limit?: number;
  search?: string;
  dormId?: string;
  status?: string;
  totalBeds?: number;
  userIdCard?: string;
}

export interface RoomDTO {
  id: string;
  dormId: string;
  name: string;
  block: string;
  floor: number;
  price: number;
  totalBeds: number;
  availableBeds: number;
  amenities: string[];
  status: string;
  hasUserDeposit?: boolean;
  userRegistrationId?: string;
  beds?: BedDTO[];
}

export interface CreateRoomDTO {
  dormId: string;
  name: string;
  block: string;
  floor: number;
  totalBeds: number;
  utilityIds?: string[];
}

export interface UpdateRoomDTO {
  name?: string;
  block?: string;
  floor?: number;
  status?: string;
  utilityIds?: string[];
}

export interface BedDTO {
  id: string;
  roomId: string;
  bedNumber: string;
  status: string;
  price: number;
}