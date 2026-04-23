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
import {ClientPreviewFormManagement} from "./pages/ClientPreviewFormManagement";

import { UserLayout } from './components/UserLayout';
import { AccountLayout } from './components/AccountLayout';
import { AdminLayout } from './components/AdminLayout';
import { AdminDorm } from './pages/admin/AdminDorm';
import { AdminDormDetail } from './pages/admin/AdminDormDetail';
import { AdminRooms } from './pages/admin/AdminRooms';
import { AdminViewing } from './pages/admin/AdminViewing';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminContracts } from './pages/admin/AdminContracts';
import { AdminHandover } from './pages/admin/AdminHandover';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminCheckout } from './pages/admin/AdminCheckout';
import { AdminRefundCalculation } from './pages/admin/AdminRefundCalculation';
import { AdminLiquidation } from './pages/admin/AdminLiquidation';

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
          <Route path="test" element={<TestPage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Customer Account Management Group */}
          <Route element={<AccountLayout />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="favourites-management" element={<FavouriteManagement />} />
            <Route path="preview-forms-management" element={<PreviewFormManagement />} />
            <Route path="orders" element={<div className="p-8 bg-white rounded-xl border border-outline-variant/10 text-center text-slate-500 italic">Tính năng Đơn hàng sẽ sớm ra mắt</div>} />
            <Route path="contracts" element={<div className="p-8 bg-white rounded-xl border border-outline-variant/10 text-center text-slate-500 italic">Tính năng Hợp đồng sẽ sớm ra mắt</div>} />
            <Route path="checkout-requests" element={<div className="p-8 bg-white rounded-xl border border-outline-variant/10 text-center text-slate-500 italic">Tính năng Yêu cầu trả phòng sẽ sớm ra mắt</div>} />
          </Route>
        </Route>

        {/* Admin Portal Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dorms" replace />} />
          <Route path="dorms" element={<AdminDorm />} />
          <Route path="dorms/new" element={<AdminDormDetail />} />
          <Route path="dorms/:id" element={<AdminDormDetail />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="client-preview-forms-management" element={<ClientPreviewFormManagement />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="contracts" element={<AdminContracts />} />
          <Route path="handover" element={<AdminHandover />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="checkout" element={<AdminCheckout />} />
          <Route path="checkout/:requestId/refund-calculation" element={<AdminRefundCalculation />} />
          <Route path="checkout/:requestId/liquidation" element={<AdminLiquidation />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
