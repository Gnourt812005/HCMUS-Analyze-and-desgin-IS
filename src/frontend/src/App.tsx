import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { TestPage } from './pages/TestPage';
import { ProfilePage } from './pages/ProfilePage';

import { UserLayout } from './components/UserLayout';
import { AdminLayout } from './components/AdminLayout';
import { AdminFacilities } from './pages/admin/AdminFacilities';
import { AdminRooms } from './pages/admin/AdminRooms';
import { AdminViewing } from './pages/admin/AdminViewing';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminContracts } from './pages/admin/AdminContracts';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminCheckout } from './pages/admin/AdminCheckout';
import { AdminRefundCalculation } from './pages/admin/AdminRefundCalculation';
import { AdminLiquidation } from './pages/admin/AdminLiquidation';
import { CheckoutRequestsPage } from './pages/ViewCheckoutRequest';
import { CreateCheckoutRequestPage } from './pages/CreateCheckoutRequestPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* User Portal Layout */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<div className="flex items-center justify-center h-full"><h1 className="text-3xl font-bold text-slate-800">Trang Chủ (Coming Soon)</h1></div>} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/checkout-requests" element={<CheckoutRequestsPage />} />
          <Route path="/create-checkout-request" element={<CreateCheckoutRequestPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Admin Portal Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/facilities" replace />} />
          <Route path="facilities" element={<AdminFacilities />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="viewing" element={<AdminViewing />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="contracts" element={<AdminContracts />} />
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
