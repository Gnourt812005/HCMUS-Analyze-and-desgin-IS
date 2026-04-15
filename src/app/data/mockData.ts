export interface Dorm {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: "Còn phòng" | "Hết phòng" | "Sắp đầy";
  totalRooms: number;
  availableRooms: number;
}

export interface Room {
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

export const dorms: Dorm[] = [
  {
    id: "1",
    name: "Ký túc xá A",
    address: "123 Đường Nguyễn Văn A, Quận 1, TP.HCM",
    phone: "028 1234 5678",
    status: "Còn phòng",
    totalRooms: 120,
    availableRooms: 45,
  },
  {
    id: "2",
    name: "Ký túc xá B",
    address: "456 Đường Lê Văn B, Quận 3, TP.HCM",
    phone: "028 2345 6789",
    status: "Sắp đầy",
    totalRooms: 100,
    availableRooms: 15,
  },
  {
    id: "3",
    name: "Ký túc xá C",
    address: "789 Đường Trần Văn C, Quận 5, TP.HCM",
    phone: "028 3456 7890",
    status: "Còn phòng",
    totalRooms: 150,
    availableRooms: 80,
  },
  {
    id: "4",
    name: "Ký túc xá D",
    address: "321 Đường Phạm Văn D, Quận 7, TP.HCM",
    phone: "028 4567 8901",
    status: "Hết phòng",
    totalRooms: 80,
    availableRooms: 0,
  },
];

export const rooms: Room[] = [
  {
    id: "101",
    dormId: "1",
    name: "A101",
    block: "Block A",
    tower: "Tòa A",
    floor: 1,
    price: 1500000,
    totalBeds: 4,
    availableBeds: 2,
    amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học"],
    specialNotes: ["Gần thang máy", "Gần bãi giữ xe"],
    imageUrl: "bedroom-1",
    favoriteCount: 12,
  },
  {
    id: "102",
    dormId: "1",
    name: "A102",
    block: "Block A",
    tower: "Tòa A",
    floor: 1,
    price: 2000000,
    totalBeds: 2,
    availableBeds: 1,
    amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học", "Nhà tắm riêng"],
    specialNotes: ["Nhà tắm riêng", "View đẹp"],
    imageUrl: "bedroom-2",
    favoriteCount: 25,
  },
  {
    id: "201",
    dormId: "1",
    name: "A201",
    block: "Block A",
    tower: "Tòa A",
    floor: 2,
    price: 1800000,
    totalBeds: 4,
    availableBeds: 3,
    amenities: ["Điều hòa", "Wifi", "Bàn học"],
    specialNotes: ["View công viên"],
    imageUrl: "bedroom-3",
    favoriteCount: 8,
  },
  {
    id: "301",
    dormId: "1",
    name: "B101",
    block: "Block B",
    tower: "Tòa B",
    floor: 1,
    price: 1200000,
    totalBeds: 6,
    availableBeds: 4,
    amenities: ["Điều hòa", "Wifi"],
    specialNotes: ["Phòng lớn"],
    imageUrl: "bedroom-4",
    favoriteCount: 5,
  },
  {
    id: "302",
    dormId: "1",
    name: "B102",
    block: "Block B",
    tower: "Tòa B",
    floor: 1,
    price: 2500000,
    totalBeds: 2,
    availableBeds: 0,
    amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học", "Nhà tắm riêng", "Ban công"],
    specialNotes: ["Nhà tắm riêng", "Ban công rộng"],
    imageUrl: "bedroom-5",
    favoriteCount: 45,
  },
  {
    id: "401",
    dormId: "1",
    name: "C101",
    block: "Block C",
    tower: "Tòa C",
    floor: 1,
    price: 1600000,
    totalBeds: 4,
    availableBeds: 1,
    amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học"],
    specialNotes: ["Gần khu bếp chung"],
    imageUrl: "bedroom-6",
    favoriteCount: 15,
  },
  {
    id: "501",
    dormId: "2",
    name: "B-101",
    block: "Tầng 1",
    tower: "Tòa chính",
    floor: 1,
    price: 1400000,
    totalBeds: 4,
    availableBeds: 2,
    amenities: ["Điều hòa", "Wifi", "Bàn học"],
    specialNotes: ["Gần cổng chính"],
    imageUrl: "bedroom-1",
    favoriteCount: 10,
  },
  {
    id: "502",
    dormId: "3",
    name: "C-201",
    block: "Tầng 2",
    tower: "Tòa Nam",
    floor: 2,
    price: 1700000,
    totalBeds: 3,
    availableBeds: 2,
    amenities: ["Điều hòa", "Tủ lạnh", "Wifi", "Bàn học"],
    specialNotes: ["View thoáng"],
    imageUrl: "bedroom-2",
    favoriteCount: 18,
  },
];
