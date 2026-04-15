import { createBrowserRouter } from "react-router";
import DormSelection from "./components/DormSelection";
import RoomList from "./components/RoomList";
import FavoriteRooms from "./components/FavoriteRooms";
import BookingsList from "./components/BookingsList";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DormSelection,
  },
  {
    path: "/dorm/:dormId/rooms",
    Component: RoomList,
  },
  {
    path: "/favorites",
    Component: FavoriteRooms,
  },
  {
    path: "/bookings",
    Component: BookingsList,
  },
]);
