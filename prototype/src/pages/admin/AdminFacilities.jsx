import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminFacilities = () => {
  const navigate = useNavigate();
  const facilities = [
    {
      id: "KTX-001",
      name: "Cơ sở Diamond Residence",
      address: "123 Đường Trần Duy Hưng, Cầu Giấy, Hà Nội",
      rooms: 45,
      status: "Đang hoạt động",
      statusColor: "bg-green-100 text-green-700",
      image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Building+1"
    },
    {
      id: "KTX-002",
      name: "Cơ sở Sky Central",
      address: "456 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội",
      rooms: 32,
      status: "Đang hoạt động",
      statusColor: "bg-green-100 text-green-700",
      image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Building+2"
    },
    {
      id: "KTX-003",
      name: "Cơ sở West Point",
      address: "789 Đường Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội",
      rooms: 60,
      status: "Đang sửa chữa",
      statusColor: "bg-amber-100 text-amber-700",
      image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Building+3"
    },
    {
      id: "KTX-004",
      name: "Cơ sở Landmark South",
      address: "12 Lạc Long Quân, Tây Hồ, Hà Nội",
      rooms: 24,
      status: "Đang hoạt động",
      statusColor: "bg-green-100 text-green-700",
      image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Building+4"
    },
    {
      id: "KTX-005",
      name: "Cơ sở Green View",
      address: "55 Giải Phóng, Hai Bà Trưng, Hà Nội",
      rooms: 18,
      status: "Tạm ngưng",
      statusColor: "bg-slate-100 text-slate-700",
      image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Building+5"
    }
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách cơ sở</h1>
          <p className="text-sm text-slate-500">Quản lý thông tin và trạng thái các cơ sở ký túc xá</p>
        </div>
        <button
          onClick={() => navigate('/admin/facilities/create')}
          className="bg-primary text-white py-2.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm cơ sở mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Mã KTX</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Tên cơ sở</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Địa chỉ</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Số phòng</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {facilities.map((fac, idx) => (
              <tr
                key={idx}
                onClick={() => navigate(`/admin/facilities/${fac.id}`)}
                className="hover:bg-slate-50 transition-colors duration-150 group cursor-pointer"
              >
                <td className="px-6 py-5 font-mono text-xs font-semibold text-primary">{fac.id}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img className="w-full h-full object-cover grayscale" src={fac.image} alt={fac.name} />
                    </div>
                    <span className="font-bold text-slate-900">{fac.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-500">{fac.address}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{fac.rooms}</span>
                    <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded uppercase">Phòng</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fac.statusColor}`}>
                    {fac.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Hiển thị 5 trên 12 cơ sở</span>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
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

export default AdminFacilities;
