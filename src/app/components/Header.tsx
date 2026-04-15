import { LogIn, LogOut, User, Heart, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useBookings } from "../context/BookingsContext";
import { useState } from "react";
import { useNavigate } from "react-router";
import LoginModal from "./LoginModal";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { favorites } = useFavorites();
  const { bookings } = useBookings();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="absolute right-6 top-6 z-10 flex items-center gap-3">
        {isAuthenticated && (
          <>
            <button
              onClick={() => navigate("/bookings")}
              className="relative flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm transition-colors hover:bg-neutral-50"
            >
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Lịch xem</span>
              {bookings.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {bookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/favorites")}
              className="relative flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm transition-colors hover:bg-neutral-50"
            >
              <Heart className="h-4 w-4 text-red-600" />
              <span className="text-sm">Quan tâm</span>
              {favorites.size > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                  {favorites.size}
                </span>
              )}
            </button>
          </>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm">
              <User className="h-4 w-4 text-neutral-600" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm transition-colors hover:bg-neutral-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Đăng xuất</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <LogIn className="h-4 w-4" />
            <span className="text-sm">Đăng nhập</span>
          </button>
        )}
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}
