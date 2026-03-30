import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PasswordRecovery = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }
    toast.success('Mã OTP đã được gửi đến email của bạn');
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    toast.success('Xác thực OTP thành công');
    setStep(3);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
    navigate('/login');
  };

  return (
    <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden min-h-[80vh]">
      {/* Abstract Architectural Shapes (Background) */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -z-10"></div>

      <div className="relative w-full max-w-md">
        {step === 1 && (
          <div className="bg-surface-container-lowest p-8 md:p-10 rounded-xl shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)] border border-outline-variant/15">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-high rounded-full mb-6 relative overflow-hidden">
                <span className="material-symbols-outlined text-primary text-3xl font-bold z-10">lock_reset</span>
              </div>
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-3">Khôi phục mật khẩu</h1>
              <p className="text-on-surface-variant text-sm leading-relaxed">Nhập địa chỉ email liên kết với tài khoản của bạn để nhận mã OTP xác thực.</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">mail</span>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-high border-0 rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest text-on-surface placeholder:text-outline transition-all duration-200 outline-none"
                    placeholder="example@dormarch.vn"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-sm tracking-wide rounded-lg shadow-md hover:brightness-105 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
                <span>Gửi mã OTP</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-outline-variant/15 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-container transition-colors group">
                <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">keyboard_backspace</span>
                Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến.
              </Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-surface-container-lowest p-8 md:p-10 rounded-xl shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)] border border-outline-variant/15 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-container"></div>
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-high rounded-full mb-6 text-primary">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
              </div>
              <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-3">Xác thực mã OTP</h1>
              <p className="text-on-surface-variant text-sm leading-relaxed">Không nhận được mã? Gửi lại trong 59s</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="flex justify-between gap-2 md:gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                  />
                ))}
              </div>
              <div className="space-y-4">
                <button type="submit" className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-lg shadow-sm hover:brightness-105 transition-all active:scale-[0.98]">
                  Xác thực OTP
                </button>
                <div className="flex flex-col items-center gap-6">
                  <button type="button" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-2 group">
                    <span className="material-symbols-outlined text-lg group-hover:rotate-180 transition-transform duration-500">refresh</span>
                    Gửi lại mã (60s)
                  </button>
                  <div className="w-full h-px bg-outline-variant/15"></div>
                  <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-primary hover:underline flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Quay lại
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="bg-surface-container-lowest p-8 md:p-10 rounded-xl shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)] border border-outline-variant/10">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 text-primary">
                <span className="material-symbols-outlined text-3xl">lock_reset</span>
              </div>
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-3">Đặt lại mật khẩu mới</h1>
              <p className="text-on-surface-variant text-sm leading-relaxed">Vui lòng thiết lập mật khẩu mới cho tài khoản của bạn để hoàn tất quá trình khôi phục.</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[0.6875rem] font-bold tracking-[0.05em] uppercase text-on-surface-variant px-1">Mật khẩu mới</label>
                <div className="relative group">
                  <input type="password" required className="w-full h-12 px-4 bg-surface-container-high border-none rounded-lg text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all duration-200" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[0.6875rem] font-bold tracking-[0.05em] uppercase text-on-surface-variant px-1">Mật khẩu mới</label>
                <div className="relative group">
                  <input type="password" required className="w-full h-12 px-4 bg-surface-container-high border-none rounded-lg text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all duration-200" placeholder="••••••••" />
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <div className="h-1 flex-1 bg-primary rounded-full"></div>
                <div className="h-1 flex-1 bg-primary rounded-full"></div>
                <div className="h-1 flex-1 bg-primary rounded-full"></div>
              </div>

              <button type="submit" className="w-full h-12 bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <span>Cập nhật mật khẩu</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
};

export default PasswordRecovery;
