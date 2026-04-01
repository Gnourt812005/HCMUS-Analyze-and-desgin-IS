import React from 'react';
import RoomCard from '../components/RoomCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleProtectedAction = (e, path) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Need to sign in to use this feature');
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  const featuredRooms = [
    {
      id: "room-1",
      imageSrc: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
      imageAlt: "Luxury Studio",
      badgeText: "Có sẵn",
      badgeColorType: "primary",
      title: "Căn hộ Studio cao cấp Landmark 81 - View sông",
      location: "Bình Thạnh, TP.HCM",
      price: "8.500.000",
      rating: "4.9"
    },
    {
      id: "room-2",
      imageSrc: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
      imageAlt: "Cozy Room",
      badgeText: "Mới đăng",
      badgeColorType: "primary",
      title: "Phòng trọ Full nội thất Quận 1 - Gần chợ Bến Thành",
      location: "Quận 1, TP.HCM",
      price: "5.200.000",
      rating: "4.7"
    },
    {
      id: "room-3",
      imageSrc: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
      imageAlt: "Shared Dorm",
      badgeText: "Kí túc xá",
      badgeColorType: "secondary",
      title: "Kí túc xá SleepBox cao cấp - Gần làng Đại Học",
      location: "Thủ Đức, TP.HCM",
      price: "1.800.000",
      rating: "4.5"
    },
    {
      id: "room-4",
      imageSrc: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
      imageAlt: "Modern Loft",
      badgeText: "Giá tốt",
      badgeColorType: "error",
      title: "Phòng Gác lửng phong cách tối giản - Khu KDC Him Lam",
      location: "Quận 7, TP.HCM",
      price: "4.500.000",
      rating: "4.8"
    }
  ];

  return (
    <main className="pt-24 pb-20">
      {/* Hero & Filter Section */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-12 md:p-20 mb-[2rem]">
          <img
            alt="Modern apartment interior"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image"
          />
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Tìm không gian <span className="text-primary-fixed-dim">lý tưởng</span> cho cuộc sống mới.
            </h1>
            <p className="text-slate-200 text-lg md:text-xl font-light mb-8 leading-relaxed">
              Nơi cung cấp những căn phòng trọ, căn hộ lưu trú hiện đại đáp ứng mọi nhu cầu sống của bạn.
            </p>
          </div>
        </div>

        {/* Filter Panel (Overlapping) */}
        <div className="relative z-20 max-w-6xl mx-auto">
          <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-2xl shadow-slate-200/50 border border-outline-variant/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              {/* Location Filter */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-outline tracking-widest uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">location_on</span> Khu vực
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <select className="w-full bg-surface-container-high border-none rounded-lg text-sm py-3 px-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none">
                    <option>Tất cả</option>
                    <option>Hà Nội</option>
                    <option>Đà Nẵng</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-outline tracking-widest uppercase">Quận / Huyện</label>
                <select className="w-full bg-surface-container-high border-none rounded-lg text-sm py-3 px-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none">
                  <option>Quận 1</option>
                  <option>Quận 7</option>
                  <option>Quận Bình Thạnh</option>
                  <option>Thủ Đức</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-outline tracking-widest uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">payments</span> Khoảng giá (VND)
                </label>
                <div className="flex items-center gap-2">
                  <input className="w-full bg-surface-container-high border-none rounded-lg text-sm py-3 px-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" placeholder="Từ" type="number" />
                  <span className="text-outline">-</span>
                  <input className="w-full bg-surface-container-high border-none rounded-lg text-sm py-3 px-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" placeholder="Đến" type="number" />
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={() => navigate('/rooms')}
                className="bg-primary-container text-white h-[48px] rounded-lg font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
              >
                <span className="material-symbols-outlined">search</span> Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Room Grid Section */}
      <section className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">Phòng nổi bật</h2>
            <p className="text-outline">Những không gian sống cao cấp được yêu thích nhất.</p>
          </div>
          <button
            onClick={() => navigate('/rooms')}
            className="text-primary font-semibold flex items-center gap-1 hover:underline underline-offset-4"
          >
            Xem tất cả <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredRooms.map(room => (
            <RoomCard key={room.id} {...room} />
          ))}
        </div>
      </section>

      {/* Bento Features Section */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-12 text-center">Trải nghiệm dịch vụ tuyệt vời cùng DormArch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
          <div className="md:col-span-2 bg-primary-container rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-white text-5xl mb-4">verified_user</span>
              <h3 className="text-2xl font-bold text-white mb-2">Thông tin bảo mật 100%</h3>
              <p className="text-blue-100 max-w-md">Tất cả thông tin tài khoản và giao dịch trên nền tảng được mã hóa an toàn.</p>
            </div>
          </div>
          <div className="bg-surface-container-high rounded-3xl p-8 flex flex-col justify-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-5xl mb-4">payments</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Thanh toán an toàn</h3>
            <p className="text-outline text-sm">Chúng tôi cung cấp nhiều phương thức thanh toán an toàn, minh bạch hàng đầu.</p>
          </div>
          <div className="bg-surface-container-high rounded-3xl p-8 flex flex-col justify-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-5xl mb-4">support_agent</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Hỗ trợ 24/7</h3>
            <p className="text-outline text-sm">Đội ngũ hỗ trợ nhiệt tình, giải đáp nhanh chóng mọi thắc mắc của bạn.</p>
          </div>
          <div className="md:col-span-2 bg-secondary-container rounded-3xl p-8 flex items-center justify-between relative overflow-hidden group">
            <div className="relative z-10 max-w-xs">
              <h3 className="text-2xl font-bold text-on-secondary-container mb-2">Hợp đồng điện tử</h3>
              <p className="text-on-secondary-container opacity-80">Quy trình ký hợp đồng thuê trực tuyến an toàn và tiện lợi.</p>
            </div>
            <span className="material-symbols-outlined text-[120px] text-on-secondary-container/10 absolute -right-4 -bottom-4 rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>contract</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
