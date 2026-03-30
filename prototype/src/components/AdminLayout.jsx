import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    toast.error('Vui lòng đăng nhập để truy cập Admin Portal', { id: 'admin-auth' });
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased">
      <AdminSidebar />
      <main className="ml-64 min-h-screen p-6 md:p-8 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
