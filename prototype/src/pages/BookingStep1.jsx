import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookingStep1 = () => {
  const navigate = useNavigate();
  const [bedCount, setBedCount] = useState(1);

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/booking/step2-payment');
  };

  return (
    <main className="flex-grow pt-24 pb-12 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Progress Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative max-w-md mx-auto">
          {/* Step 1: Active */}
          <div className="flex flex-col items-center z-10">
            <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold mb-2 shadow-lg shadow-primary/20">
              1
            </div>
            <span className="text-sm font-semibold text-primary">Đăng ký</span>
          </div>
          {/* Connector Line */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-surface-container-high -z-0">
            <div className="h-full bg-primary-container w-1/2"></div>
          </div>
          {/* Step 2: Inactive */}
          <div className="flex flex-col items-center z-10">
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-outline flex items-center justify-center font-bold mb-2">
              2
            </div>
            <span className="text-sm font-medium text-outline">Thanh toán</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Room Preview */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
            <img
              alt="Studio Room Preview"
              className="w-full h-64 object-cover"
              src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image"
            />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">Phòng Cao Cấp</span>
              </div>
              <h2 className="text-2xl font-extrabold text-on-surface leading-tight mb-2">Đăng ký thông tin</h2>
              <div className="flex items-center text-outline text-sm mb-4">
                <span className="material-symbols-outlined text-sm mr-1">location_on</span>
                Vui lòng điền thông tin cá nhân của bạn để bắt đầu tạo hợp đồng.
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                <span className="text-outline text-sm">Giá cọc dự kiến</span>
                <span className="text-xl font-bold text-secondary">5.500.000đ</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
            <label className="block text-sm font-bold text-on-surface mb-4 uppercase tracking-widest">Thông tin liên hệ</label>
            <div className="flex items-center justify-between p-1 bg-surface-container-high rounded-lg">
              <button
                type="button"
                onClick={() => setBedCount(Math.max(1, bedCount - 1))}
                className="w-12 h-12 flex items-center justify-center bg-surface-container-lowest rounded-md shadow-sm text-primary hover:bg-primary hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="text-xl font-bold font-headline">{bedCount.toString().padStart(2, '0')}</span>
              <button
                type="button"
                onClick={() => setBedCount(Math.min(2, bedCount + 1))}
                className="w-12 h-12 flex items-center justify-center bg-surface-container-lowest rounded-md shadow-sm text-primary hover:bg-primary hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <p className="mt-3 text-xs text-outline italic text-center">Bản sao CCCD sẽ được mã hóa an toàn.</p>
          </div>
        </div>

        {/* Right Column: Form Info */}
        <div className="md:col-span-7">
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm h-full flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-extrabold text-on-surface mb-2">Thông tin khách hàng</h3>
              <p className="text-on-surface-variant text-sm">Xác nhận thông tin chính xác</p>
            </div>
            <form onSubmit={handleNext} className="space-y-6 flex-grow flex flex-col">
              <div className="space-y-4 flex-grow">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider" htmlFor="full_name">Họ và tên</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">person</span>
                    <input required className="w-full pl-12 pr-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" id="full_name" placeholder="Nguyễn Văn A" type="text" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider" htmlFor="phone">Số điện thoại</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">call</span>
                    <input required className="w-full pl-12 pr-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" id="phone" placeholder="090x xxx xxx" type="tel" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider" htmlFor="email">Email (Tùy chọn)</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
                    <input className="w-full pl-12 pr-4 py-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" id="email" placeholder="email@example.com" type="email" />
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-auto">
                <button className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2" type="submit">
                  Tiếp tục
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <p className="text-center mt-4 text-xs text-outline">
                  Tôi đồng ý với các <a className="text-primary underline" href="#">Điều khoản dịch vụ</a> của HappyHome.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingStep1;
