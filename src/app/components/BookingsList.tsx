import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ChevronLeft, Calendar, Clock, MapPin, Building2, X } from "lucide-react";
import { useBookings } from "../context/BookingsContext";
import Header from "./Header";
import BookingDetailModal from "./BookingDetailModal";
import ConfirmCancelModal from "./ConfirmCancelModal";

export default function BookingsList() {
  const navigate = useNavigate();
  const { bookings } = useBookings();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

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
              <Calendar className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg">Lịch xem phòng</h2>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {sortedBookings.length > 0 ? (
          <>
            <div className="mb-4 text-neutral-600">
              Bạn có {sortedBookings.length} lịch xem phòng
            </div>

            <div className="space-y-3">
              {sortedBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md"
                >
                  <div
                    onClick={() => setSelectedBookingId(booking.id)}
                    className="cursor-pointer p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="mb-1">
                              Phòng {booking.roomName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                              <Building2 className="h-4 w-4" />
                              <span>{booking.dormName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Clock className="h-4 w-4" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{booking.dormAddress}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCancelBookingId(booking.id);
                        }}
                        className="shrink-0 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </motion.div>
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
                <Calendar className="h-12 w-12 text-neutral-400" />
              </div>
            </div>
            <h3 className="mb-2">Chưa có lịch xem phòng</h3>
            <p className="mb-6 text-neutral-600">
              Bạn chưa đăng ký lịch xem phòng nào
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

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBookingId(null)}
        />
      )}

      {cancelBookingId && (
        <ConfirmCancelModal
          bookingId={cancelBookingId}
          onClose={() => setCancelBookingId(null)}
        />
      )}
    </div>
  );
}
