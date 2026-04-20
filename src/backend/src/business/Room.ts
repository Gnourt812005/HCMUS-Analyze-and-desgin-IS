export class Room {
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

  constructor(data: Partial<Room>) {
    this.id = data.id || '';
    this.dormId = data.dormId || '';
    this.name = data.name || '';
    this.block = data.block || '';
    this.tower = data.tower || '';
    this.floor = data.floor || 0;
    this.price = data.price || 0;
    this.totalBeds = data.totalBeds || 0;
    this.availableBeds = data.availableBeds || 0;
    this.amenities = data.amenities || [];
    this.specialNotes = data.specialNotes || [];
    this.imageUrl = data.imageUrl || '';
    this.favoriteCount = data.favoriteCount || 0;
  }
}
