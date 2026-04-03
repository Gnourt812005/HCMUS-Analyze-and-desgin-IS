import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Favorites = () => {
  const navigate = useNavigate();

  const favoriteRooms = [
    {
      id: 'room-102',
      name: 'Căn hộ Studio cao cấp Landmark 81',
      facility: 'Diamond Residence',
      price: '12.500.000',
      status: 'Còn trống',
      image: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Image'
    },
    {
      id: 'room-305',
      name: 'Phòng Studio Hiện Đại B-305',
      facility: 'Sky Central',
      price: '8.000.000',
      status: 'Sắp trống',
      image: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Image'
    }
  ];

  const handleRemoveFavorite = (name) => {
    toast.success(`Đã bỏ quan tâm ${name}`);
  };

  return (
    <main className="flex-grow pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        <Sidebar />

        <section className="md:col-span-9 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Phòng quan tâm</h1>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant/10">
              <h3 className="text-lg font-bold text-on-surface">Danh sách phòng bạn đang quan tâm</h3>
              <p className="text-sm text-outline">Lưu lại các phòng ưng ý để dễ dàng theo dõi và đặt lịch xem.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-outline">Hình ảnh</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-outline">Thông tin phòng</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-outline">Giá thuê</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-outline">Trạng thái</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-outline text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {favoriteRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="w-20 h-14 rounded-lg overflow-hidden bg-surface-container-high shadow-sm border border-outline-variant/10">
                          <img alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={room.image} />
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span
                            onClick={() => navigate(`/room/${room.id}`)}
                            className="font-bold text-sm text-on-surface hover:text-primary cursor-pointer transition-colors"
                          >
                            {room.name}
                          </span>
                          <span className="text-xs text-outline flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {room.facility}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-headline font-bold text-secondary text-sm">
                        {room.price} <span className="text-[10px] font-medium text-outline">VNĐ/tháng</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${room.status === 'Còn trống' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/room/${room.id}`)}
                            className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-xl">visibility</span>
                          </button>
                          <button
                            onClick={() => handleRemoveFavorite(room.name)}
                            className="p-2 text-error hover:bg-error/5 rounded-lg transition-colors"
                            title="Bỏ quan tâm"
                          >
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>heart_minus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex items-center justify-between">
              <p className="text-xs text-outline font-medium">Bạn hiện có {favoriteRooms.length} phòng quan tâm</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Favorites;
