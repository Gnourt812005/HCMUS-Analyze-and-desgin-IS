import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import toast from 'react-hot-toast';

import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import BookingStep1 from './pages/BookingStep1';
import BookingStep2 from './pages/BookingStep2';
import ViewingRequest from './pages/ViewingRequest';
import Profile from './pages/Profile';
import Contracts from './pages/Contracts';
import ViewingHistory from './pages/ViewingHistory';
import Orders from './pages/Orders';
import Favorites from './pages/Favorites';
import PasswordRecovery from './pages/PasswordRecovery';
import Register from './pages/Register';

import AdminLayout from './components/AdminLayout';
import AdminRooms from './pages/admin/AdminRooms';
import AdminRoomDetail from './pages/admin/AdminRoomDetail';
import AdminOrders from './pages/admin/AdminOrders';
import AdminViewing from './pages/admin/AdminViewing';
import AdminContracts from './pages/admin/AdminContracts';
import AdminFacilities from './pages/admin/AdminFacilities';
import AdminFacilityDetail from './pages/admin/AdminFacilityDetail';
import AdminStaff from './pages/admin/AdminStaff';
import AdminStaffDetail from './pages/admin/AdminStaffDetail';
import AdminContractDetail from './pages/admin/AdminContractDetail';

const Login = () => {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    login();
    toast.success('Đăng nhập thành công!');
    navigate('/');
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 pt-12 pb-24 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-fixed/30 blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary-fixed/20 blur-[100px] -z-10"></div>

      <div className="w-full max-w-md bg-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)] rounded-xl overflow-hidden transition-all duration-300">
        <div className="flex border-b border-surface-container">
          <div className="flex-1 py-5 text-center font-headline font-bold text-sm tracking-tight text-primary relative">
            Đăng nhập
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
          </div>
          <Link to="/register" className="flex-1 py-5 text-center font-headline font-bold text-sm tracking-tight text-slate-500 hover:text-primary transition-colors">
            Đăng ký
          </Link>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-on-surface mb-2">Chào mừng trở lại</h1>
            <p className="text-on-surface-variant text-sm">Vui lòng đăng nhập để tiếp tục.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="font-label text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant font-semibold">Email / Số điện thoại</label>
                <div className="relative group">
                  <input type="text" defaultValue="guest@arch-digital.vn" className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-sm focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200 peer outline-none ring-2 ring-transparent focus:ring-primary/10" placeholder="Nhập bất kỳ..." />
                  <div className="absolute inset-0 border-2 border-primary opacity-0 peer-focus:opacity-15 rounded-lg pointer-events-none transition-opacity duration-200"></div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant font-semibold">Mật khẩu</label>
                <div className="relative group">
                  <input type="password" defaultValue="guest" className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-sm focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200 peer outline-none ring-2 ring-transparent focus:ring-primary/10" placeholder="Nhập bất kỳ..." />
                  <div className="absolute inset-0 border-2 border-primary opacity-0 peer-focus:opacity-15 rounded-lg pointer-events-none transition-opacity duration-200"></div>
                </div>
              </div>
            </div>

            <div className="mb-6 text-right">
              <Link to="/recover-password" className="text-sm font-medium text-primary hover:underline">Quên mật khẩu?</Link>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-lg font-headline font-bold text-sm tracking-tight shadow-md shadow-primary/20 hover:brightness-110 active:scale-95 transition-all duration-200"
            >
              Đăng nhập ngay
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    toast.error('Cần đăng nhập để sử dụng tính năng này', { id: 'auth-error' });
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover-password" element={<PasswordRecovery />} />
          <Route path="/room/:id" element={<ProtectedRoute><RoomDetail /></ProtectedRoute>} />
          <Route path="/booking/step1-register" element={<ProtectedRoute><BookingStep1 /></ProtectedRoute>} />
          <Route path="/booking/step2-payment" element={<ProtectedRoute><BookingStep2 /></ProtectedRoute>} />
          <Route path="/viewing-request" element={<ProtectedRoute><ViewingRequest /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
          <Route path="/viewing-history" element={<ProtectedRoute><ViewingHistory /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/facilities" replace />} />
          <Route path="/admin/facilities" element={<AdminLayout><AdminFacilities /></AdminLayout>} />
          <Route path="/admin/facilities/:id" element={<AdminLayout><AdminFacilityDetail /></AdminLayout>} />
          <Route path="/admin/rooms" element={<AdminLayout><AdminRooms /></AdminLayout>} />
          <Route path="/admin/rooms/:id" element={<AdminLayout><AdminRoomDetail /></AdminLayout>} />
          <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
          <Route path="/admin/viewing" element={<AdminLayout><AdminViewing /></AdminLayout>} />
          <Route path="/admin/contracts" element={<AdminLayout><AdminContracts /></AdminLayout>} />
          <Route path="/admin/contracts/:id" element={<AdminLayout><AdminContractDetail /></AdminLayout>} />
          <Route path="/admin/staff" element={<AdminLayout><AdminStaff /></AdminLayout>} />
          <Route path="/admin/staff/:id" element={<AdminLayout><AdminStaffDetail /></AdminLayout>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
