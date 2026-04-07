import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClient } from '../api/ApiClient';

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm_password') as string;

    if (password !== confirm) {
      alert('Mật khẩu không khớp!');
      return;
    }

    try {
      await ApiClient.post('/auth/sign-up', {
        body: JSON.stringify({ email, password })
      });

      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối mạng');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 pt-12 pb-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-100/30 blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-slate-200/20 blur-[100px] -z-10"></div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)] rounded-xl overflow-hidden transition-all duration-300">

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-100">
          <Link to="/login" className="flex-1 py-5 text-center font-headline font-bold text-sm tracking-tight text-slate-500 hover:text-blue-700 transition-colors">
            Đăng nhập
          </Link>
          <div className="flex-1 py-5 text-center font-headline font-bold text-sm tracking-tight text-blue-700 relative">
            Đăng ký
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-700"></div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-slate-900 mb-2">Bắt đầu ngay</h1>
            <p className="text-slate-600 text-sm">Kiến tạo không gian lưu trú hiện đại của bạn.</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="font-label text-[0.6875rem] uppercase tracking-[0.05em] text-slate-500 font-semibold">Email</label>
              <div className="relative group">
                <input name="email" required className="w-full bg-slate-50 border-none rounded-lg px-4 py-3.5 text-sm focus:ring-0 focus:bg-white transition-all duration-200 peer outline-none ring-2 ring-transparent focus:ring-blue-100" placeholder="example@email.com" type="email" />
                <div className="absolute inset-0 border-2 border-blue-500 opacity-0 peer-focus:opacity-15 rounded-lg pointer-events-none transition-opacity duration-200"></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label text-[0.6875rem] uppercase tracking-[0.05em] text-slate-500 font-semibold">Mật khẩu</label>
              <div className="relative group">
                <input name="password" required className="w-full bg-slate-50 border-none rounded-lg px-4 py-3.5 text-sm focus:ring-0 focus:bg-white transition-all duration-200 peer outline-none ring-2 ring-transparent focus:ring-blue-100" placeholder="••••••••" type={showPassword ? "text" : "password"} />
                <div className="absolute inset-0 border-2 border-blue-500 opacity-0 peer-focus:opacity-15 rounded-lg pointer-events-none transition-opacity duration-200"></div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-700 cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label text-[0.6875rem] uppercase tracking-[0.05em] text-slate-500 font-semibold">Xác nhận mật khẩu</label>
              <div className="relative group">
                <input name="confirm_password" required className="w-full bg-slate-50 border-none rounded-lg px-4 py-3.5 text-sm focus:ring-0 focus:bg-white transition-all duration-200 peer outline-none ring-2 ring-transparent focus:ring-blue-100" placeholder="••••••••" type={showPassword ? "text" : "password"} />
                <div className="absolute inset-0 border-2 border-blue-500 opacity-0 peer-focus:opacity-15 rounded-lg pointer-events-none transition-opacity duration-200"></div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-700 cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white py-4 rounded-lg font-headline font-bold text-sm tracking-tight shadow-md hover:brightness-110 active:scale-95 transition-all duration-200 mt-8" type="submit">
              Đăng ký
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
