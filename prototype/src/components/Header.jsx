import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Bell } from 'lucide-react';

export const Header = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm font-manrope antialiased tracking-tight">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-blue-700">DormArch</Link>
          <div className="hidden md:flex gap-6">
            <Link to="/" className="text-slate-600 hover:text-blue-600 transition-colors">Trang chủ</Link>
            <Link to="/rooms" className="text-slate-600 hover:text-blue-600 transition-colors">Danh sách phòng</Link>
            <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Về chúng tôi</a>
            <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Cẩm nang thuê phòng</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/admin')}
                className="bg-slate-900 text-white px-4 py-2 text-sm font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 mr-2"
                title="Truy cập dành cho Ban quản lý"
              >
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                Admin Portal
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                <Bell className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <User className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={logout}
                className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-all"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 rounded-xl text-blue-700 font-medium hover:bg-slate-50 transition-all duration-200"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-primary-container text-on-primary-container px-6 py-2 rounded-xl font-semibold shadow-md hover:brightness-110 transition-all"
              >
                Bắt đầu ngay
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
