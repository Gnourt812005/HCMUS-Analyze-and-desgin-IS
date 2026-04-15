import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ChevronLeft, Heart } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import { rooms } from "../data/mockData";
import RoomCard from "./RoomCard";
import RoomDetailModal from "./RoomDetailModal";
import Header from "./Header";
import { dorms } from "../data/mockData";

export default function FavoriteRooms() {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const favoriteRooms = rooms.filter((room) => favorites.has(room.id));

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const selectedDorm = selectedRoom
    ? dorms.find((d) => d.id === selectedRoom.dormId)
    : undefined;

  return (
    <div className="relative min-h-screen bg-neutral-50">
      <Header />
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-neutral-600 transition-colors hover:text-neutral-900"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Quay lại</span>
            </button>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 fill-red-600 text-red-600" />
              <h2 className="text-lg">Phòng quan tâm</h2>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {favoriteRooms.length > 0 ? (
          <>
            <div className="mb-4 text-neutral-600">
              Bạn có {favoriteRooms.length} phòng quan tâm
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favoriteRooms.map((room, index) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  index={index}
                  onClick={() => setSelectedRoomId(room.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-neutral-100 p-6">
                <Heart className="h-12 w-12 text-neutral-400" />
              </div>
            </div>
            <h3 className="mb-2">Chưa có phòng quan tâm</h3>
            <p className="mb-6 text-neutral-600">
              Bạn chưa thêm phòng nào vào danh sách quan tâm
            </p>
            <button
              onClick={() => navigate("/")}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Khám phá phòng
            </button>
          </motion.div>
        )}
      </div>

      {selectedRoom && selectedDorm && (
        <RoomDetailModal
          room={selectedRoom}
          dorm={selectedDorm}
          onClose={() => setSelectedRoomId(null)}
        />
      )}
    </div>
  );
}
