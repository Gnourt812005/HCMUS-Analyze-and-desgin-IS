import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ViewingRequest = () => {
  const navigate = useNavigate();

  const handleConfirm = (e) => {
    e.preventDefault();
    toast.success('Yêu cầu xem phòng đã được gửi! Quản lý sẽ liên hệ trong ít phút.');
    navigate('/rooms');
  };

  return (
    <main className="flex-grow pt-24 pb-12 px-4 flex items-center justify-center bg-surface-container-low min-h-screen relative">
      {/* Backdrop Simulation */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="w-full h-full opacity-20"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD2TvM78niu42AfTeB7bvXFhEM65ga9gSNR4QjlfTxU6d6jEtGlYZsQT1d3vLcMOMdoMbqDgxnHScY-FsB2zzgGVPBAhVI9J4lHNMZfguVStvaxXhu1Tf5e3Iei1agTnTfldTjRXQDsVmw2z09iqXFa7TLMLnfCyLRvF-8ou9g047VJ3XJ9fKkeonIdA6xzoc__O1VfLFlVf72SZ_1oVBg_c84xvVCTgP8HTkyW8NCo3GiRwKF25nQwj2AiXZOBmLQ7g_AqD8e_6pg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        ></div>
        <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm"></div>
      </div>

      {/* Booking Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row mt-6">
        {/* Visual Sidebar */}
        <div className="md:w-1/3 relative hidden md:block">
          <img
            alt="Phòng Studio Cao Cấp"
            className="w-full h-full object-cover"
            src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex items-end p-6">
            <p className="text-white font-headline font-bold text-lg leading-tight">Không gian sống hiện đại và tiện nghi</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="md:w-2/3 p-8 lg:p-10 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[0.6875rem] font-bold tracking-widest text-primary uppercase mb-2 block">Đặt lịch xem</span>
              <h2 className="text-2xl font-extrabold text-on-surface tracking-tight leading-none">Yêu Cầu Xem Phòng</h2>
            </div>
            <button
              className="text-outline hover:text-on-surface transition-colors"
              onClick={() => navigate(-1)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form className="space-y-5 flex-grow" onSubmit={handleConfirm}>
            {/* Room Name (Read-only) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-outline tracking-wider uppercase">Tên phòng</label>
              <div className="flex items-center gap-3 bg-surface-container-high px-4 py-3 rounded-lg border border-transparent focus-within:border-primary/20 transition-all">
                <span className="material-symbols-outlined text-primary">meeting_room</span>
                <input
                  className="bg-transparent border-none p-0 w-full text-on-surface font-semibold focus:ring-0 cursor-default"
                  readOnly
                  type="text"
                  value="Phòng Studio Cao Cấp - Tòa A1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Date Picker */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-outline tracking-wider uppercase">Ngày xem phòng</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">calendar_today</span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface"
                    min={new Date().toISOString().split('T')[0]}
                    required
                    type="date"
                  />
                </div>
              </div>
              {/* Time Slot */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-outline tracking-wider uppercase">Khung giờ</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">schedule</span>
                  <select
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface appearance-none"
                    required
                    defaultValue=""
                  >
                    <option disabled value="">Chọn khung giờ</option>
                    <option value="morning">Sáng (08:00 - 11:30)</option>
                    <option value="afternoon">Chiều (13:30 - 17:00)</option>
                    <option value="evening">Tối (18:00 - 20:30)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-outline tracking-wider uppercase">Ghi chú thêm</label>
              <div className="relative">
                <textarea
                  className="w-full p-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface resize-none"
                  placeholder="Ví dụ: Tôi muốn xem thêm khu vực tiện ích chung..."
                  rows="3"
                ></textarea>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                className="w-full bg-primary-container text-white py-4 rounded-lg font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                type="submit"
              >
                <span>Xác nhận lịch hẹn</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <p className="text-center mt-4 text-[0.75rem] text-outline italic">
                Yêu cầu của bạn sẽ được quản lý xác nhận trong vòng 24h.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ViewingRequest;
