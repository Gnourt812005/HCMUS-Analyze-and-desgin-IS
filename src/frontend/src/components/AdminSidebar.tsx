import { NavLink, useNavigate } from 'react-router-dom';
import { AuthService } from '../api/AuthService';
import { UserRole } from '@dormarch/shared';

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const role = AuthService.getRole();

  const navItems = [
    { path: '/admin/dorms', icon: 'domain', label: 'Ký túc xá', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { path: '/admin/rooms', icon: 'bed', label: 'Phòng', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { path: '/admin/client-preview-forms-management', icon: 'calendar_month', label: 'Lịch xem phòng khách hàng', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SALE_STAFF] },
    { path: '/admin/orders', icon: 'shopping_cart', label: 'Đơn hàng', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { path: '/admin/contracts', icon: 'description', label: 'Hợp đồng', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { path: '/admin/handover', icon: 'assignment_turned_in', label: 'Bàn giao phòng', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { path: '/admin/staff', icon: 'badge', label: 'Nhân viên', roles: [UserRole.ADMIN] },
    { path: '/admin/checkout', icon: 'logout', label: 'Trả phòng', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { path: '/admin/utilities', icon: 'settings_accessibility', label: 'Tiện ích', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  ];

  const filteredItems = navItems.filter(item => 
    !item.roles || (role && item.roles.includes(role as UserRole))
  );

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col z-50 overflow-y-auto bg-slate-50 w-64 border-r border-slate-200 shadow-sm">
      {/* Brand Identity */}
      <div className="p-6 flex flex-col gap-1 cursor-pointer" onClick={() => navigate('/')}>
        <span className="text-xl font-black tracking-tighter text-blue-800">DormArch</span>
        <span className="font-manrope font-bold tracking-tight text-xs uppercase opacity-60">Management Portal</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-3 px-4 py-3 text-blue-700 font-bold border-r-4 border-blue-700 bg-blue-50 transition-all"
                : "flex items-center gap-3 px-4 py-3 text-slate-600 font-medium hover:bg-slate-100 hover:text-blue-600 transition-colors duration-200"
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm font-inter">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 flex flex-col gap-2">
        <div className="mt-4 pt-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 font-medium hover:bg-slate-100 hover:text-red-600 transition-colors duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-inter">Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
