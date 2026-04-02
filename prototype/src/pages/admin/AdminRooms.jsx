import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminRooms = () => {
  const navigate = useNavigate();
  const rooms = [
    {
      id: "LX-402-A",
      name: "Lux Suite 402",
      campus: "Sky Tower Residences",
      price: "4.500.000đ",
      beds: "02",
      status: "CÒN TRỐNG",
      statusColor: "text-green-700 bg-green-100",
      statusDot: "bg-green-500",
      image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
    },
    {
      id: "ST-B12-M",
      name: "Studio B-12",
      campus: "Green Valley Campus",
      price: "3.200.000đ",
      beds: "04",
      status: "ĐÃ ĐẶT",
      statusColor: "text-primary bg-primary-container/10",
      statusDot: "bg-primary",
      image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
    },
    {
      id: "SD-105-X",
      name: "Standard 105",
      campus: "Sky Tower Residences",
      price: "2.800.000đ",
      beds: "01",
      status: "ĐANG SỬA",
      statusColor: "text-error bg-error-container/20",
      statusDot: "bg-error",
      image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
    },
    {
      id: "GL-001-K",
      name: "Grand Loft 01",
      campus: "The Urban Collective",
      price: "5.800.000đ",
      beds: "02",
      status: "CÒN TRỐNG",
      statusColor: "text-green-700 bg-green-100",
      statusDot: "bg-green-500",
      image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image",
    }
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách phòng</h1>
          <p className="text-sm text-slate-500">Quản lý thông tin chi tiết các phòng trong hệ thống</p>
        </div>
        <button
          onClick={() => navigate('/admin/rooms/create')}
          className="bg-primary text-white py-2.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm phòng mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Hình ảnh</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Tên phòng</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Thuộc KTX</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Giá thuê</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-center">Số giường</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rooms.map((room, idx) => (
              <tr
                key={idx}
                onClick={() => navigate(`/admin/rooms/${room.id}`)}
                className="hover:bg-slate-50 transition-colors duration-150 group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-100">
                    <img alt={room.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" src={room.image} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-manrope font-bold text-slate-900 block">{room.name}</span>
                  <span className="text-[10px] text-slate-500/70 uppercase tracking-tighter">ID: {room.id}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-500">{room.campus}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-secondary font-bold text-sm tracking-tight bg-secondary-container/20 px-3 py-1 rounded-full">{room.price}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-medium text-slate-500">{room.beds}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${room.statusColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${room.statusDot}`}></span>
                    {room.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Minimal Pagination */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Hiển thị 1 - 4 trên 128 phòng</span>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="p-2 rounded-lg bg-primary text-white shadow-md">
              <span className="text-xs font-bold px-1">1</span>
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <span className="text-xs font-medium px-1">2</span>
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminRooms;
