import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin/facilities', icon: 'domain', label: 'Ký túc xá' },
    { path: '/admin/rooms', icon: 'bed', label: 'Phòng' },
    { path: '/admin/viewing', icon: 'calendar_month', label: 'Lịch xem' },
    { path: '/admin/orders', icon: 'shopping_cart', label: 'Đơn hàng' },
    { path: '/admin/contracts', icon: 'description', label: 'Hợp đồng' },
    { path: '/admin/staff', icon: 'badge', label: 'Nhân viên' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col z-50 overflow-y-auto bg-slate-50 dark:bg-slate-950 w-64 border-r border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
      {/* Brand Identity */}
      <div className="p-6 flex flex-col gap-1 cursor-pointer" onClick={() => navigate('/')}>
        <span className="text-xl font-black tracking-tighter text-blue-800 dark:text-blue-400">DormArch</span>
        <span className="font-manrope font-bold tracking-tight text-xs uppercase opacity-60">Management Portal</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-3 px-4 py-3 text-blue-700 dark:text-blue-400 font-bold border-r-4 border-blue-700 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 transition-all"
                : "flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm font-inter">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* CTA & Footer */}
      <div className="p-4 flex flex-col gap-2">
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-200">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-inter">Cài đặt</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-red-600 transition-colors duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-inter">Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
