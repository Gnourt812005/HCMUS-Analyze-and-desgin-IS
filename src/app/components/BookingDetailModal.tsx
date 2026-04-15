import { motion } from "motion/react";
import { X, Building2, MapPin, Calendar, Clock, User, Phone } from "lucide-react";
import { Booking } from "../types/booking";

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function BookingDetailModal({
  booking,
  onClose,
}: BookingDetailModalProps) {
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
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
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-lg bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 p-6">
          <h2>Chi tiết lịch xem phòng</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <h3 className="mb-3">Thông tin phòng</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-neutral-600" />
                <div>
                  <div className="text-sm text-neutral-600">Phòng</div>
                  <div>{booking.roomName}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-neutral-600" />
                <div>
                  <div className="text-sm text-neutral-600">Ký túc xá</div>
                  <div>{booking.dormName}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-neutral-600" />
                <div>
                  <div className="text-sm text-neutral-600">Địa chỉ</div>
                  <div>{booking.dormAddress}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <h3 className="mb-3">Thời gian xem phòng</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-neutral-600" />
                <div>
                  <div className="text-sm text-neutral-600">Ngày</div>
                  <div>{formatDate(booking.date)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-neutral-600" />
                <div>
                  <div className="text-sm text-neutral-600">Giờ</div>
                  <div>{booking.time}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-3 text-blue-900">Nhân viên phụ trách</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-700" />
                <div>
                  <div className="text-sm text-blue-700">Tên</div>
                  <div className="text-blue-900">{booking.salesStaff.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-700" />
                <div>
                  <div className="text-sm text-blue-700">Số điện thoại</div>
                  <a
                    href={`tel:${booking.salesStaff.phone}`}
                    className="text-blue-900 hover:underline"
                  >
                    {booking.salesStaff.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
              Vui lòng đến đúng giờ và mang theo CMND/CCCD để xác thực
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-neutral-200 p-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
