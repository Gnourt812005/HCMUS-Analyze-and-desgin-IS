import { useState } from "react";
import { motion } from "motion/react";
import { X, Calendar, Clock, CheckCircle } from "lucide-react";
import { Room, Dorm } from "../data/mockData";
import { useBookings } from "../context/BookingsContext";
import { getRandomSalesStaff } from "../data/salesStaff";

interface PreviewBookingModalProps {
  room: Room;
  dorm: Dorm;
  onClose: () => void;
}

export default function PreviewBookingModal({
  room,
  dorm,
  onClose,
}: PreviewBookingModalProps) {
  const { addBooking } = useBookings();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate date and time are in the future
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (selectedDateTime <= now) {
      setError("Ngày và giờ xem phòng phải là thời điểm trong tương lai");
      return;
    }

    // Add booking
    addBooking({
      roomId: room.id,
      roomName: room.name,
      dormId: dorm.id,
      dormName: dorm.name,
      dormAddress: dorm.address,
      date,
      time,
      salesStaff: getRandomSalesStaff(),
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-2xl"
        >
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="mb-2">Đăng ký thành công!</h2>
          <p className="text-neutral-600">
            Bạn đã đăng ký xem phòng {room.name} vào {formatDateDisplay(date)} lúc {time}.
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Chúng tôi sẽ liên hệ với bạn sớm.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2>Đăng ký xem phòng</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-neutral-50 p-4">
          <h3 className="mb-1">Phòng {room.name}</h3>
          <p className="text-sm text-neutral-600">{room.block}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="mb-2 flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Ngày xem phòng
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError("");
              }}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
            {date && (
              <div className="mt-1 text-sm text-neutral-600">
                Ngày đã chọn: {formatDateDisplay(date)}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="time" className="mb-2 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Giờ xem phòng
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                setError("");
              }}
              required
              className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            Lưu ý: Vui lòng đến đúng giờ đã đăng ký. Mang theo CMND/CCCD để xác thực.
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            Xác nhận đăng ký
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
