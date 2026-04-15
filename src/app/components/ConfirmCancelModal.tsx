import { motion } from "motion/react";
import { X, AlertTriangle } from "lucide-react";
import { useBookings } from "../context/BookingsContext";

interface ConfirmCancelModalProps {
  bookingId: string;
  onClose: () => void;
}

export default function ConfirmCancelModal({
  bookingId,
  onClose,
}: ConfirmCancelModalProps) {
  const { cancelBooking } = useBookings();

  const handleConfirm = () => {
    cancelBooking(bookingId);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h2 className="mb-2 text-center">Xác nhận hủy lịch</h2>
        <p className="mb-6 text-center text-neutral-600">
          Bạn có chắc chắn muốn hủy lịch xem phòng này không? Hành động này không
          thể hoàn tác.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-neutral-300 px-6 py-3 transition-colors hover:bg-neutral-50"
          >
            Giữ lại
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-lg bg-red-600 px-6 py-3 text-white transition-colors hover:bg-red-700"
          >
            Hủy lịch
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
