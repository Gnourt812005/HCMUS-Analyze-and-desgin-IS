import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../api/AuthService';

export const Header = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    isLoggedIn: AuthService.isLoggedIn(),
    canAccessAdmin: AuthService.canAccessAdmin()
  });

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthState({
        isLoggedIn: AuthService.isLoggedIn(),
        canAccessAdmin: AuthService.canAccessAdmin()
      });
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const logout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm font-manrope antialiased tracking-tight">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-blue-700">HappyHome</Link>
        </div>
        <div className="flex items-center gap-4">
          {authState.isLoggedIn ? (
            <div className="flex items-center space-x-2">
              {authState.canAccessAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-slate-900 text-white px-4 py-2 text-sm font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 mr-2"
                  title="Truy cập dành cho Ban quản lý"
                >
                  <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                  Trang quản trị
                </button>
              )}
              <button
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-slate-600 text-xl">person</span>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
