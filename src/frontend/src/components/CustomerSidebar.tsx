import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export const CustomerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    alert('Đã đăng xuất thành công.');
    navigate('/');
  };

  const menuItems = [
    { path: '/profile', icon: 'person', label: 'Thông tin cá nhân' },
    { path: '/favourites-management', icon: 'favorite', label: 'Phòng quan tâm' },
    { path: '/preview-forms-management', icon: 'calendar_today', label: 'Lịch xem phòng' },
    { path: '/orders', icon: 'shopping_cart', label: 'Đơn hàng' },
    { path: '/contracts', icon: 'description', label: 'Hợp đồng' },
  ];

  return (
    <aside className="md:col-span-3 space-y-4">
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/10">
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-outline-variant/20">
            <button onClick={handleLogout} className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-error hover:bg-error/5 transition-all">
              <span className="material-symbols-outlined">logout</span>
              <span className="text-sm">Đăng xuất</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};
