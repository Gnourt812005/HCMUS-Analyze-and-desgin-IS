/**
 * Shared types and interfaces for the DormArch project
 */

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'tenant';
  avatar?: string;
}

export interface RoomDTO {
  id: string;
  name: string;
  facility: string;
  price: number;
  status: 'available' | 'occupied' | 'maintenance' | 'pending';
  images: string[];
  description: string;
}

export interface ViewingRequestDTO {
  id: string;
  userId: string;
  roomId: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  note?: string;
}
