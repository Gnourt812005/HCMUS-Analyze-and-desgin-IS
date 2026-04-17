import { Navigate, Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AuthService } from '../api/AuthService';

export const AdminLayout = () => {
  const isLoggedIn = AuthService.isLoggedIn();
  const isAdmin = AuthService.isAdmin();

  // Basic security guard
  if (!isLoggedIn) {
    alert('Vui lòng đăng nhập để truy cập Admin Portal');
    return <Navigate to="/login" replace />;
  }

  // Strict role check (optional but recommended)
  if (!isAdmin) {
    alert('Bạn không có quyền truy cập khu vực này');
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased flex">
      <AdminSidebar />
      <main className="flex-1 min-h-screen p-6 md:p-8 flex flex-col ml-64">
        <Outlet />
      </main>
    </div>
  );
};
