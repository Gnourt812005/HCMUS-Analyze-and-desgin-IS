import React from 'react';
import RoomCard from '../components/RoomCard';
import { useNavigate } from 'react-router-dom';

const Rooms = () => {
  const navigate = useNavigate();

  const roomList = [
    {
      id: "room-5",
      imageSrc: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
      imageAlt: "Phòng trọ ban công thoáng mát",
      badgeText: "Hot",
      badgeColorType: "primary",
      title: "Phòng trọ ban công thoáng mát",
      location: "Quận Bình Thạnh, TP. HCM",
      price: "4.200.000",
      rating: "4.8" // Placeholder rating for UI consistency
    },
    {
      id: "room-6",
      imageSrc: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
      imageAlt: "Căn hộ dịch vụ Full nội thất",
      badgeText: "Mới",
      badgeColorType: "secondary",
      title: "Căn hộ dịch vụ Full nội thất",
      location: "Quận 1, TP. HCM",
      price: "7.500.000",
      rating: "4.9"
    },
    {
      id: "room-7",
      imageSrc: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
      imageAlt: "Phòng KTX cao cấp gần ĐH Ngoại Thương",
      badgeText: "Cần thuê gấp",
      badgeColorType: "error",
      title: "Phòng KTX cao cấp gần ĐH Ngoại Thương",
      location: "Quận Bình Thạnh, TP. HCM",
      price: "2.800.000",
      rating: "4.5"
    },
    {
      id: "room-8",
      imageSrc: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
      imageAlt: "Studio ban công Sky View",
      badgeText: "",
      badgeColorType: "primary",
      title: "Studio ban công Sky View",
      location: "Quận 7, TP. HCM",
      price: "5.500.000",
      rating: "4.7"
    },
    {
      id: "room-9",
      imageSrc: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
      imageAlt: "Phòng đơn nội thất gỗ cao cấp",
      badgeText: "",
      badgeColorType: "primary",
      title: "Phòng đơn nội thất gỗ cao cấp",
      location: "Quận 3, TP. HCM",
      price: "6.200.000",
      rating: "4.6"
    },
    {
      id: "room-10",
      imageSrc: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
      imageAlt: "Studio phong cách Industrial",
      badgeText: "Hot",
      badgeColorType: "primary",
      title: "Studio phong cách Industrial",
      location: "Quận 2, TP. HCM",
      price: "8.000.000",
      rating: "4.9"
    },
    {
      id: "room-11",
      imageSrc: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
      imageAlt: "Phòng trọ giá rẻ cho sinh viên",
      badgeText: "",
      badgeColorType: "primary",
      title: "Phòng trọ giá rẻ cho sinh viên",
      location: "Quận Thủ Đức, TP. HCM",
      price: "3.000.000",
      rating: "4.3"
    },
    {
      id: "room-12",
      imageSrc: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
      imageAlt: "Căn hộ cao cấp Vinhomes Central Park",
      badgeText: "",
      badgeColorType: "primary",
      title: "Căn hộ cao cấp Vinhomes Central Park",
      location: "Quận Bình Thạnh, TP. HCM",
      price: "15.000.000",
      rating: "5.0"
    }
  ];

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-6">
      {/* Search & Filter Bar (Sticky-ish) */}
      <section className="sticky top-20 z-40 mb-12">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end">

            {/* Location Selects */}
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-wider text-on-surface-variant uppercase">Tỉnh/Thành phố</label>
              <select className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all outline-none">
                <option>Hồ Chí Minh</option>
                <option>Hà Nội</option>
                <option>Đà Nẵng</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-wider text-on-surface-variant uppercase">Quận/Huyện</label>
              <select className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all outline-none">
                <option>Quận 1</option>
                <option>Quận Bình Thạnh</option>
                <option>Quận 7</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-wider text-on-surface-variant uppercase">Phường/Xã</label>
              <select className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all outline-none">
                <option>Phường 25</option>
                <option>Phường Đa Kao</option>
                <option>Tân Thuận Đông</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="block text-xs font-bold tracking-wider text-on-surface-variant uppercase">Khoảng giá</label>
                <span className="text-xs font-semibold text-secondary">2M - 15M đ</span>
              </div>
              <div className="relative pt-1">
                <input className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" max="20" min="0" step="1" type="range" />
              </div>
            </div>

            {/* Search Button */}
            <div className="md:col-span-4 lg:col-span-1">
              <button className="w-full bg-primary-container text-white font-headline font-bold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-primary-container/20 transition-all duration-300 flex items-center justify-center space-x-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
                <span>Tìm kiếm</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Room Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {roomList.map((room) => (
          <RoomCard key={room.id} {...room} />
        ))}
      </section>

      {/* Pagination */}
      <nav aria-label="Page navigation" className="flex justify-center mt-16 mb-8">
        <ul className="inline-flex items-center -space-x-px">
          <li>
            <a className="px-4 py-2.5 ml-0 leading-tight text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 rounded-l-lg hover:bg-surface-container hover:text-primary transition-all flex items-center shadow-sm" href="#">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </a>
          </li>
          <li>
            <a className="px-5 py-2.5 leading-tight text-white bg-primary border border-primary font-bold transition-all shadow-md shadow-primary/20" href="#">1</a>
          </li>
          <li>
            <a className="px-5 py-2.5 leading-tight text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container hover:text-primary transition-all shadow-sm" href="#">2</a>
          </li>
          <li>
            <a className="px-5 py-2.5 leading-tight text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container hover:text-primary transition-all shadow-sm" href="#">3</a>
          </li>
          <li>
            <a className="px-5 py-2.5 leading-tight text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container hover:text-primary transition-all shadow-sm" href="#">4</a>
          </li>
          <li>
            <span className="px-5 py-2.5 leading-tight text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30">...</span>
          </li>
          <li>
            <a className="px-4 py-2.5 leading-tight text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 rounded-r-lg hover:bg-surface-container hover:text-primary transition-all flex items-center shadow-sm" href="#">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </a>
          </li>
        </ul>
      </nav>
    </main>
  );
};

export default Rooms;
