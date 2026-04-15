import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Room, Dorm } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import {
  X,
  Heart,
  Building2,
  Bed,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import LoginModal from "./LoginModal";
import PreviewBookingModal from "./PreviewBookingModal";

interface RoomDetailModalProps {
  room: Room;
  dorm: Dorm;
  onClose: () => void;
}

const roomImages: Record<string, string> = {
  "bedroom-1": "https://images.unsplash.com/photo-1553172366-55b235a466f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-2": "https://images.unsplash.com/photo-1609363650758-e4b1400add8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-3": "https://images.unsplash.com/photo-1579632151052-92f741fb9b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-4": "https://images.unsplash.com/photo-1694151569569-8288e3118519?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-5": "https://images.unsplash.com/flagged/photo-1582108074095-1730ef6caec9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-6": "https://images.unsplash.com/photo-1570570665905-346e1b6be193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
};

export default function RoomDetailModal({
  room,
  dorm,
  onClose,
}: RoomDetailModalProps) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [favoriteCount, setFavoriteCount] = useState(room.favoriteCount);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const isFavorited = isFavorite(room.id);

  useEffect(() => {
    setFavoriteCount(
      room.favoriteCount + (isFavorited ? 1 : 0)
    );
  }, [isFavorited, room.favoriteCount]);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    toggleFavorite(room.id);
  };

  const handlePreviewClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowPreviewModal(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
            <ImageWithFallback
              src={roomImages[room.imageUrl] || roomImages["bedroom-1"]}
              alt={room.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="mb-2">Phòng {room.name}</h2>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Building2 className="h-4 w-4" />
                  <span>{dorm.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-2 text-2xl text-blue-600">
                  {room.price.toLocaleString()} VNĐ
                </div>
                <div className="text-sm text-neutral-500">/tháng</div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-neutral-50 p-4 md:grid-cols-4">
              <div className="text-center">
                <Bed className="mx-auto mb-2 h-5 w-5 text-neutral-600" />
                <div className="text-sm text-neutral-600">Tổng giường</div>
                <div className="mt-1">{room.totalBeds}</div>
              </div>
              <div className="text-center">
                <Users className="mx-auto mb-2 h-5 w-5 text-neutral-600" />
                <div className="text-sm text-neutral-600">Còn trống</div>
                <div
                  className={`mt-1 ${room.availableBeds > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {room.availableBeds}
                </div>
              </div>
              <div className="text-center">
                <Building2 className="mx-auto mb-2 h-5 w-5 text-neutral-600" />
                <div className="text-sm text-neutral-600">Vị trí</div>
                <div className="mt-1">{room.tower}</div>
              </div>
              <div className="text-center">
                <MapPin className="mx-auto mb-2 h-5 w-5 text-neutral-600" />
                <div className="text-sm text-neutral-600">Tầng</div>
                <div className="mt-1">Tầng {room.floor}</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3">Tiện ích</h3>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {room.specialNotes.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3">Lưu ý đặc biệt</h3>
                <div className="space-y-2">
                  {room.specialNotes.map((note) => (
                    <div
                      key={note}
                      className="flex items-start gap-2 text-sm text-neutral-600"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleFavoriteClick}
                className={`flex items-center gap-2 rounded-lg border px-4 py-3 transition-all ${
                  isFavorited
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-neutral-300 bg-white text-neutral-600 hover:border-red-300"
                }`}
              >
                <Heart
                  className={`h-5 w-5 ${isFavorited ? "fill-red-600" : ""}`}
                />
                <span className="text-sm">{favoriteCount}</span>
              </button>

              <button
                onClick={handlePreviewClick}
                disabled={room.availableBeds === 0}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {room.availableBeds === 0
                  ? "Hết chỗ"
                  : "Đăng ký xem phòng"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {showPreviewModal && (
        <PreviewBookingModal
          room={room}
          dorm={dorm}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </>
  );
}
