import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminContracts = () => {
  const navigate = useNavigate();
  const contracts = [
    {
      id: "CNT-8821",
      customer: "Nguyễn Văn Lộc",
      avatarBg: "bg-primary-fixed text-primary",
      avatarLetters: "NL",
      room: "A-102 (Deluxe)",
      startDate: "12/10/2023",
      status: "Đang hiệu lực",
      statusColor: "bg-blue-100 text-blue-700"
    },
    {
      id: "CNT-9014",
      customer: "Trần Minh Huy",
      avatarBg: "bg-secondary-fixed text-secondary",
      avatarLetters: "TH",
      room: "B-305 (Studio)",
      startDate: "05/11/2023",
      status: "Chờ ký",
      statusColor: "bg-amber-100 text-amber-700"
    },
    {
      id: "CNT-7732",
      customer: "Phạm Ngọc Anh",
      avatarBg: "bg-surface-variant text-slate-500",
      avatarLetters: "PA",
      room: "C-201 (Basic)",
      startDate: "20/09/2023",
      status: "Kết thúc",
      statusColor: "bg-slate-100 text-slate-500"
    },
    {
      id: "CNT-1109",
      customer: "Lê Quốc Dũng",
      avatarBg: "bg-primary-fixed text-primary",
      avatarLetters: "LD",
      room: "A-404 (Penthouse)",
      startDate: "01/12/2023",
      status: "Đang hiệu lực",
      statusColor: "bg-blue-100 text-blue-700"
    },
    {
      id: "CNT-4456",
      customer: "Hoàng Thanh Tùng",
      avatarBg: "bg-error-container text-on-error-container",
      avatarLetters: "HT",
      room: "D-102 (Standard)",
      startDate: "15/08/2023",
      status: "Thanh lý",
      statusColor: "bg-error-container text-on-error-container"
    },
    {
      id: "CNT-2290",
      customer: "Mai Văn Vũ",
      avatarBg: "bg-primary-fixed text-primary",
      avatarLetters: "MV",
      room: "B-202 (Suite)",
      startDate: "10/11/2023",
      status: "Chờ ký",
      statusColor: "bg-amber-100 text-amber-700"
    },
    {
      id: "CNT-3381",
      customer: "Võ Hoàng Nam",
      avatarBg: "bg-primary-fixed text-primary",
      avatarLetters: "VH",
      room: "C-105 (Standard)",
      startDate: "02/12/2023",
      status: "Đang hiệu lực",
      statusColor: "bg-blue-100 text-blue-700"
    }
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý hợp đồng</h1>
          <p className="text-sm text-slate-500">Theo dõi, gia hạn và xử lý các hợp đồng thuê phòng</p>
        </div>
        <button
          onClick={() => navigate('/admin/contracts/create')}
          className="bg-primary text-white py-2.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo hợp đồng
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto relative">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Mã HĐ</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Khách thuê</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Phòng</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Giá thuê</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-center">Thời hạn</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {contracts.map((contract, idx) => (
              <tr
                key={idx}
                onClick={() => navigate(`/admin/contracts/${contract.id}`)}
                className="hover:bg-slate-50 transition-colors duration-150 group cursor-pointer"
              >
                <td className="px-6 py-5 font-inter text-sm font-bold text-primary">{contract.id}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${contract.avatarBg}`}>
                      {contract.avatarLetters}
                    </div>
                    <span className="font-inter text-sm text-slate-900">{contract.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-5 font-inter text-sm text-slate-500">{contract.room}</td>
                <td className="px-6 py-5 font-inter text-sm text-slate-500 text-right">-</td>
                <td className="px-6 py-5 font-inter text-sm text-slate-500 text-center">-</td>
                <td className="px-6 py-5 text-right">
                  <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${contract.statusColor}`}>
                    {contract.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Hiển thị 5 / 45 hợp đồng</span>
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
              <span className="text-xs font-medium px-1">...</span>
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <span className="text-xs font-medium px-1">9</span>
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

export default AdminContracts;
