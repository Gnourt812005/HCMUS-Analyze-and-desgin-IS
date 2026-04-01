import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BookingStep2 = () => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState('momo');

  const handlePaymentConfirm = () => {
    toast.success('Thanh toán thành công! Chúng tôi sẽ liên hệ bạn sớm.');
    navigate('/rooms');
  };

  return (
    <main className="flex-grow pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
      {/* Progress Steps */}
      <div className="mb-12 max-w-3xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-high -z-10 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500"></div>
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-3 bg-surface px-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold ring-4 ring-primary/10 cursor-pointer" onClick={() => navigate('/booking/step1-register')}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
            <span className="text-sm font-semibold text-on-surface">1. Đăng ký</span>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center gap-3 bg-surface px-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold ring-8 ring-primary/20">
              2
            </div>
            <span className="text-sm font-bold text-primary">2. Thanh toán</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Payment Methods */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
            <h2 className="text-2xl font-extrabold tracking-tight mb-8 text-on-surface">Thanh toán đặt cọc</h2>
            <div className="space-y-4">
              {/* MoMo */}
              <label className="group relative flex items-center p-4 rounded-xl border-2 border-surface-container-high hover:border-primary/50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary-container/5">
                <input
                  className="hidden"
                  name="payment"
                  type="radio"
                  checked={selectedPayment === 'momo'}
                  onChange={() => setSelectedPayment('momo')}
                />
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-pink-50 flex items-center justify-center">
                  <span className="text-pink-600 font-bold text-xs uppercase">MoMo</span>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="font-bold text-on-surface">Ví điện tử MoMo</p>
                  <p className="text-xs text-on-surface-variant">Studio A-102</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-outline-variant group-has-[:checked]:border-primary group-has-[:checked]:bg-primary flex items-center justify-center transition-all">
                  <div className="w-2 h-2 rounded-full bg-white opacity-0 group-has-[:checked]:opacity-100"></div>
                </div>
              </label>

              {/* ZaloPay */}
              <label className="group relative flex items-center p-4 rounded-xl border-2 border-surface-container-high hover:border-primary/50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary-container/5">
                <input
                  className="hidden"
                  name="payment"
                  type="radio"
                  checked={selectedPayment === 'zalopay'}
                  onChange={() => setSelectedPayment('zalopay')}
                />
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-blue-50 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs uppercase text-center leading-tight">Zalo<br />Pay</span>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="font-bold text-on-surface">Ví điện tử ZaloPay</p>
                  <p className="text-xs text-on-surface-variant">Tháng 1</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-outline-variant group-has-[:checked]:border-primary group-has-[:checked]:bg-primary flex items-center justify-center transition-all">
                  <div className="w-2 h-2 rounded-full bg-white opacity-0 group-has-[:checked]:opacity-100"></div>
                </div>
              </label>

              {/* VNPAY */}
              <label className="group relative flex items-center p-4 rounded-xl border-2 border-surface-container-high hover:border-primary/50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary-container/5">
                <input
                  className="hidden"
                  name="payment"
                  type="radio"
                  checked={selectedPayment === 'vnpay'}
                  onChange={() => setSelectedPayment('vnpay')}
                />
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-red-50 flex items-center justify-center">
                  <span className="text-red-600 font-bold text-xs uppercase">VNPAY</span>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="font-bold text-on-surface">VNPAY-QR</p>
                  <p className="text-xs text-on-surface-variant">1 Tháng</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-outline-variant group-has-[:checked]:border-primary group-has-[:checked]:bg-primary flex items-center justify-center transition-all">
                  <div className="w-2 h-2 rounded-full bg-white opacity-0 group-has-[:checked]:opacity-100"></div>
                </div>
              </label>

              {/* Bank Transfer */}
              <label className="group relative flex items-center p-4 rounded-xl border-2 border-surface-container-high hover:border-primary/50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary-container/5">
                <input
                  className="hidden"
                  name="payment"
                  type="radio"
                  checked={selectedPayment === 'bank'}
                  onChange={() => setSelectedPayment('bank')}
                />
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">account_balance</span>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="font-bold text-on-surface">Nguyễn Nam</p>
                  <p className="text-xs text-on-surface-variant">090 123 4567</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-outline-variant group-has-[:checked]:border-primary group-has-[:checked]:bg-primary flex items-center justify-center transition-all">
                  <div className="w-2 h-2 rounded-full bg-white opacity-0 group-has-[:checked]:opacity-100"></div>
                </div>
              </label>
            </div>
          </div>

          {/* QR Area (Contextual) - Mock showing it based on selected Method */}
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col items-center justify-center border border-dashed border-outline-variant">
            <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
              <img
                alt="Mã QR thanh toán"
                className="w-40 h-40"
                src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image"
              />
            </div>
            <p className="text-sm font-medium text-on-surface-variant text-center max-w-xs">
              Vui lòng sử dụng ứng dụng {selectedPayment === 'momo' ? 'Ví MoMo' : selectedPayment === 'zalopay' ? 'ZaloPay' : selectedPayment === 'vnpay' ? 'Ngân hàng' : 'Ngân hàng'} để quét mã QR phía trên để hoàn tất thanh toán.
            </p>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="p-6 bg-primary-container/5 border-b border-outline-variant/10">
              <h3 className="text-lg font-bold text-on-surface">Tóm tắt đơn hàng</h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Room Details */}
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    alt="Phòng Dorm Cao Cấp"
                    className="w-full h-full object-cover"
                    src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">Phương thức</span>
                  <h4 className="font-bold text-lg text-on-surface leading-tight">Phòng Studio A102</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-sm text-secondary">king_bed</span>
                    <span className="text-sm text-on-surface-variant">01 Giường đôi</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-outline-variant/10">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Giá phòng hàng tháng</span>
                  <span className="font-medium">4.500.000đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Phí dịch vụ cơ bản</span>
                  <span className="font-medium">200.000đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Thời hạn hợp đồng</span>
                  <span className="font-medium">06 Tháng</span>
                </div>

                <div className="pt-4 flex justify-between items-end">
                  <div>
                    <p className="text-sm font-bold text-on-surface">Tổng tiền đặt cọc</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Thanh toán an toàn</p>
                  </div>
                  <span className="text-2xl font-extrabold text-secondary tracking-tight">4.500.000đ</span>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-6 space-y-4">
                <button
                  onClick={handlePaymentConfirm}
                  className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-md"
                >
                  Xác nhận thanh toán
                </button>
                <p className="text-[11px] text-on-surface-variant text-center leading-relaxed">
                  Tôi đã đọc và đồng ý với <a className="text-primary underline" href="#">Điều khoản dịch vụ</a> và <a className="text-primary underline" href="#">Chính sách bảo mật</a> của DormArch.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all">
            <span className="material-symbols-outlined text-4xl" title="Secure Payment">verified_user</span>
            <span className="material-symbols-outlined text-4xl" title="SSL Encrypted">lock</span>
            <span classNam="material-symbols-outlined text-4xl" title="Customer Support">headset_mic</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingStep2;
