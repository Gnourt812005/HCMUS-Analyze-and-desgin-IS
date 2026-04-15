import { createContext, useContext, useState, ReactNode } from "react";
import { Booking } from "../types/booking";

interface BookingsContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => void;
  cancelBooking: (bookingId: string) => void;
}

const BookingsContext = createContext<BookingsContextType | undefined>(
  undefined
);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const addBooking = (booking: Omit<Booking, "id" | "createdAt">) => {
    const newBooking: Booking = {
      ...booking,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date(),
    };
    setBookings((prev) => [...prev, newBooking]);
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        addBooking,
        cancelBooking,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingsContext);
  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingsProvider");
  }
  return context;
}
