import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const { login, isLoggedIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const handleRegister = (e) => {
    e.preventDefault();
    login();
    toast.success('Đăng ký thành công!');
    window.location.href = '/';
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 pt-12 pb-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-fixed/30 blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary-fixed/20 blur-[100px] -z-10"></div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)] rounded-xl overflow-hidden transition-all duration-300">

        {/* Tabs Navigation */}
        <div className="flex border-b border-surface-container">
          <Link to="/login" className="flex-1 py-5 text-center font-headline font-bold text-sm tracking-tight text-slate-500 hover:text-primary transition-colors">
            Đăng nhập
          </Link>
          <div className="flex-1 py-5 text-center font-headline font-bold text-sm tracking-tight text-primary relative">
            Đăng ký
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-on-surface mb-2">Bắt đầu ngay</h1>
            <p className="text-on-surface-variant text-sm">Kiến tạo không gian lưu trú hiện đại của bạn.</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="font-label text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant font-semibold">Email</label>
              <div className="relative group">
                <input required className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-sm focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200 peer outline-none ring-2 ring-transparent focus:ring-primary/10" placeholder="example@email.com" type="email" />
                <div className="absolute inset-0 border-2 border-primary opacity-0 peer-focus:opacity-15 rounded-lg pointer-events-none transition-opacity duration-200"></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant font-semibold">Mật khẩu</label>
              <div className="relative group">
                <input required className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-sm focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200 peer outline-none ring-2 ring-transparent focus:ring-primary/10" placeholder="••••••••" type={showPassword ? "text" : "password"} />
                <div className="absolute inset-0 border-2 border-primary opacity-0 peer-focus:opacity-15 rounded-lg pointer-events-none transition-opacity duration-200"></div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant font-semibold">Xác nhận mật khẩu</label>
              <div className="relative group">
                <input required className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 text-sm focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200 peer outline-none ring-2 ring-transparent focus:ring-primary/10" placeholder="••••••••" type={showPassword ? "text" : "password"} />
                <div className="absolute inset-0 border-2 border-primary opacity-0 peer-focus:opacity-15 rounded-lg pointer-events-none transition-opacity duration-200"></div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-lg font-headline font-bold text-sm tracking-tight shadow-md shadow-primary/20 hover:brightness-110 active:scale-95 transition-all duration-200 mt-8" type="submit">
              Đăng ký
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
