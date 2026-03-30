import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleBookingClick = () => {
    navigate('/booking/step1-register');
  };

  const handleViewingClick = () => {
    navigate('/viewing-request');
  };

  return (
    <main className="pt-24 pb-12 max-w-7xl mx-auto px-6">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant font-label">
        <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Trang chủ</button>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <button onClick={() => navigate('/rooms')} className="hover:text-primary transition-colors">Danh sách phòng</button>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-on-surface font-medium">Chi tiết phòng ở</span>
      </nav>

      {/* Top Block (60-40 split) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
        {/* Left: Media (60%) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative group aspect-[16/10] bg-surface-container rounded-xl overflow-hidden">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Main room view"
              src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image"
            />
            {/* Slider Arrows */}
            <button className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            {/* Status Badge */}
            <div className="absolute top-6 left-6 flex gap-2">
              <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg">Còn trống</span>
              <span className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest">Mới nhất</span>
            </div>

            {/* Dots Navigation */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              <div className="w-8 h-1.5 rounded-full bg-white shadow-sm"></div>
              <div className="w-2 h-1.5 rounded-full bg-white/50"></div>
              <div className="w-2 h-1.5 rounded-full bg-white/50"></div>
              <div className="w-2 h-1.5 rounded-full bg-white/50"></div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            <div className="min-w-[120px] aspect-video rounded-lg overflow-hidden border-2 border-primary cursor-pointer ring-4 ring-primary/10">
              <img className="w-full h-full object-cover" alt="Thumb 1" src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image" />
            </div>
            <div className="min-w-[120px] aspect-video rounded-lg overflow-hidden border border-outline-variant/20 cursor-pointer hover:border-primary/50 transition-colors">
              <img className="w-full h-full object-cover" alt="Thumb 2" src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image" />
            </div>
            <div className="min-w-[120px] aspect-video rounded-lg overflow-hidden border border-outline-variant/20 cursor-pointer hover:border-primary/50 transition-colors">
              <img className="w-full h-full object-cover" alt="Thumb 3" src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image" />
            </div>
            <div className="min-w-[120px] aspect-video rounded-lg overflow-hidden border border-outline-variant/20 cursor-pointer hover:border-primary/50 transition-colors">
              <img className="w-full h-full object-cover" alt="Thumb 4" src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image" />
            </div>
          </div>
        </div>

        {/* Right: Actions (40%) */}
        <div className="lg:col-span-2 flex flex-col justify-between p-8 bg-surface-container-low rounded-2xl border border-outline-variant/10">
          <div className="space-y-6">
            <div>
              <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Mã phòng: DA-Q1-{id?.replace('room-', '') || '102'}</span>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface leading-tight">Căn hộ Studio cao cấp Landmark 81 - View sông</h1>
            </div>

            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              <span className="text-sm">Landmark 81, Vinhomes Central Park, Bình Thạnh</span>
            </div>

            <div className="py-6 border-y border-outline-variant/20">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-black text-secondary">12.500.000</span>
                <span className="text-lg font-medium text-secondary/80">VNĐ/tháng</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-2 font-label">Giá trên chưa bao gồm các khoản phí sinh hoạt khác.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Diện tích</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">square_foot</span>
                  <span className="font-bold">45 m²</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Tầng</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">layers</span>
                  <span className="font-bold">Tầng 5</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <button onClick={handleBookingClick} className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">key</span> Thuê ngay
            </button>
            <button onClick={handleViewingClick} className="w-full py-5 bg-transparent border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">calendar_today</span> Đăng ký xem phòng
            </button>
            <button className="w-full py-2 text-primary font-bold text-sm hover:underline flex items-center justify-center gap-1 transition-all opacity-80 hover:opacity-100">
              Đặt cọc
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Block (Full-width) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t border-outline-variant/30">

        {/* Information & Description */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="font-headline text-2xl font-extrabold mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-primary rounded-full"></span> Tiện ích căn hộ
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {[
                { icon: 'ac_unit', label: 'Điều hòa' },
                { icon: 'water_heater', label: 'Máy nước nóng' },
                { icon: 'local_parking', label: 'Hầm để xe' },
                { icon: 'wifi', label: 'High-speed Wifi' },
                { icon: 'local_laundry_service', label: 'Máy giặt chung' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface-container-low border border-outline-variant/5 hover:border-primary/30 transition-all group">
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                  </div>
                  <span className="text-xs font-bold font-label uppercase text-on-surface-variant group-hover:text-primary transition-colors text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-headline text-2xl font-extrabold mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-primary rounded-full"></span> Thông tin căn hộ
            </h2>
            <div className="text-on-surface-variant leading-relaxed space-y-4">
              <p>Căn hộ cao cấp với đầy đủ tiện nghi, phù hợp cho sinh hoạt cá nhân hoặc cặp đôi.</p>

              <div className="bg-surface-container-lowest p-8 rounded-2xl border-l-4 border-primary shadow-sm space-y-4 mt-8">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span> Phí dịch vụ liên quan
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                  <li className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                    <span>Tiền điện:</span><span className="text-primary">4.000 VNĐ / kWh</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                    <span>Tiền nước:</span><span className="text-primary">100.000 VNĐ / người</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                    <span>Phí quản lý:</span><span className="text-primary">200.000 VNĐ / phòng</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                    <span>Internet (Wifi):</span><span className="text-emerald-600 font-bold uppercase text-[10px]">Miễn phí</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 space-y-4">
                <h4 className="font-bold text-on-surface">Nội quy tòa nhà:</h4>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-base">check_circle</span> Cấm hút thuốc trong không gian kín.
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-base">check_circle</span> Cho phép dẫn bạn qua đêm có báo trước.
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-base">check_circle</span> Tuân thủ không gian chung yên tĩnh sau 23h.
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="material-symbols-outlined text-error text-base">cancel</span> Không nuôi chó mèo.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Context */}
        <div className="space-y-8">
          <div className="bg-surface-container-high p-8 rounded-2xl">
            <h3 className="font-headline font-bold text-xl mb-6">Liên hệ quản lý</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img className="w-full h-full object-cover" alt="Manager portrait" src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image" />
              </div>
              <div>
                <p className="font-bold text-on-surface">Nguyễn Minh Quân</p>
                <p className="text-xs text-on-surface-variant">Người quản lý khu vực chung.</p>
              </div>
            </div>
            <div className="space-y-4">
              <a href="tel:0901234567" className="w-full py-4 bg-white border border-outline-variant/20 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-primary">phone_in_talk</span>
                <span className="font-bold text-sm">0901.234.567</span>
              </a>
              <a href="#" className="w-full py-4 bg-white border border-outline-variant/20 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-primary">chat</span>
                <span className="font-bold text-sm">Nhắn tin Zalo</span>
              </a>
            </div>
          </div>

          <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
            <h3 className="font-headline font-bold text-xl mb-4">Vị trí bản đồ</h3>
            <div className="aspect-square bg-surface-variant rounded-xl overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500">
              <img className="w-full h-full object-cover opacity-50 contrast-125" alt="Map mockup" src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-5xl animate-bounce drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-4 text-center">Vị trí hiển thị trên bản đồ chỉ mang tính chất tham khảo tương đối.</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RoomDetail;
