import { motion } from "motion/react";
import { Room } from "../data/mockData";
import { Bed, Users, DollarSign } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface RoomCardProps {
  room: Room;
  index: number;
  onClick: () => void;
}

const roomImages: Record<string, string> = {
  "bedroom-1": "https://images.unsplash.com/photo-1553172366-55b235a466f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-2": "https://images.unsplash.com/photo-1609363650758-e4b1400add8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-3": "https://images.unsplash.com/photo-1579632151052-92f741fb9b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-4": "https://images.unsplash.com/photo-1694151569569-8288e3118519?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-5": "https://images.unsplash.com/flagged/photo-1582108074095-1730ef6caec9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-6": "https://images.unsplash.com/photo-1570570665905-346e1b6be193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
};

export default function RoomCard({ room, index, onClick }: RoomCardProps) {
  const isAvailable = room.availableBeds > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <ImageWithFallback
          src={roomImages[room.imageUrl] || roomImages["bedroom-1"]}
          alt={room.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-red-600 px-4 py-2 text-white">
              Hết chỗ
            </span>
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm">
          <span className="text-sm">{room.block}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="mb-1">Phòng {room.name}</h3>
            <div className="flex items-center gap-1 text-blue-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-lg">
                {room.price.toLocaleString()} VNĐ
              </span>
              <span className="text-sm text-neutral-500">/tháng</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-neutral-100 pt-3">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4" />
              <span>Tổng giường:</span>
            </div>
            <span>{room.totalBeds}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-neutral-600">
              <Users className="h-4 w-4" />
              <span>Còn trống:</span>
            </div>
            <span
              className={
                isAvailable
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {room.availableBeds}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {room.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700"
            >
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
              +{room.amenities.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
