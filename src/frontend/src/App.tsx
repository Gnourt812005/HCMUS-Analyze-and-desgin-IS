import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { TestPage } from './pages/TestPage';
import { ProfilePage } from './pages/ProfilePage';

import { DormSelection } from './pages/DormSelection';
import {RoomList} from "./pages/RoomList";
import { RentalCondition } from './pages/RentalCondition';
import { RentalRegister } from './pages/RentalRegister';
import { RentalPayment } from './pages/RentalPayment';

import {FavouriteManagement} from "./pages/FavouriteManagement";
import {PreviewFormManagement} from "./pages/PreviewFormManagement";

import { UserLayout } from './components/UserLayout';
import { AdminLayout } from './components/AdminLayout';
import { AdminFacilities } from './pages/admin/AdminFacilities';
import { AdminRooms } from './pages/admin/AdminRooms';
import { AdminViewing } from './pages/admin/AdminViewing';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminContracts } from './pages/admin/AdminContracts';
import { AdminHandover } from './pages/admin/AdminHandover';
import { AdminStaff } from './pages/admin/AdminStaff';

function App() {
  return (
    <Router>
      <Routes>
        {/* User Portal Layout */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Navigate to="/dorms" replace />} />
          <Route path="dorms" element={<DormSelection />} />
          <Route path="dorm/:dormid/rooms" element={<RoomList />} />
          <Route path="rental/conditions" element={<RentalCondition />} />
          <Route path="rental/register" element={<RentalRegister />} />
          <Route path="rental/payment" element={<RentalPayment />} />

          <Route path="favoutites" element={<FavouriteManagement />} />

          <Route path="preview" element={<PreviewFormManagement />} />

          <Route path="favourites" element={<FavouriteManagement />} />

          <Route path="preview-management" element={<PreviewFormManagement />} />
          <Route path="test" element={<TestPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Admin Portal Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/facilities" replace />} />
          <Route path="facilities" element={<AdminFacilities />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="viewing" element={<AdminViewing />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="contracts" element={<AdminContracts />} />
          <Route path="handover" element={<AdminHandover />} />
          <Route path="staff" element={<AdminStaff />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
