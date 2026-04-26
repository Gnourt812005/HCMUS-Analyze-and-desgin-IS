export interface DormSelectionDTO {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: "Còn phòng" | "Hết phòng" | "Sắp đầy";
  totalRooms: number;
  availableRooms: number;
}

export interface DormDTO {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: "Còn phòng" | "Hết phòng" | "Sắp đầy" | "Đã ẩn";
  totalRooms: number;
  availableRooms: number;
  managerId: string;
  utilityIds: string[];
  utilities?: { id: string, title: string, status: string }[];
}

export interface CreateDormDTO {
  name: string;
  address: string;
  phone: string;
  totalRooms: number;
  managerId: string;
  utilityIds: string[];
}

export interface UpdateDormDTO {
  name?: string;
  address?: string;
  phone?: string;
  status?: "Còn phòng" | "Hết phòng" | "Sắp đầy" | "Đã ẩn";
  totalRooms?: number;
  availableRooms?: number;
  managerId?: string;
  utilityIds?: string[];
}

export interface GetDormsDto {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
}