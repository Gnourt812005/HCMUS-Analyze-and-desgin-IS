import { RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { BookingsProvider } from "./context/BookingsContext";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <BookingsProvider>
          <RouterProvider router={router} />
        </BookingsProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}