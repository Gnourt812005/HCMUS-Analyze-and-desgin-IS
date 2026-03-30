import React, { useState } from 'react';

const AdminViewing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const viewingRequests = [
    {
      id: "#VX-9021",
      customer: "Nguyễn Lan Anh",
      phone: "0982-123-456",
      avatarBg: "bg-primary-fixed text-primary",
      avatarLetters: "NL",
      room: "P.402 - The Landmark",
      time: "14:30",
      date: "25/10/2023",
      status: "Chờ xác nhận",
      statusColor: "bg-secondary-container text-on-secondary-container"
    },
    {
      id: "#VX-9022",
      customer: "Trần Văn Tú",
      phone: "0905-888-999",
      avatarBg: "bg-tertiary-fixed text-tertiary",
      avatarLetters: "TV",
      room: "P.105 - Skyline Tower",
      time: "09:00",
      date: "26/10/2023",
      status: "Đã xác nhận",
      statusColor: "bg-primary-container/10 text-primary"
    },
    {
      id: "#VX-9023",
      customer: "Lê Minh Tâm",
      phone: "0912-444-555",
      avatarBg: "bg-slate-100est text-slate-500",
      avatarLetters: "LM",
      room: "Studio B - Central Park",
      time: "16:15",
      date: "26/10/2023",
      status: "Đã hủy",
      statusColor: "bg-error-container text-on-error-container"
    },
    {
      id: "#VX-9024",
      customer: "Phạm Thị Thanh",
      phone: "0888-000-111",
      avatarBg: "bg-primary-fixed text-primary",
      avatarLetters: "PT",
      room: "P.808 - Green View",
      time: "10:45",
      date: "27/10/2023",
      status: "Đã hoàn thành",
      statusColor: "bg-slate-100est text-slate-500"
    },
    {
      id: "#VX-9025",
      customer: "Hoàng Khôi",
      phone: "0977-222-333",
      avatarBg: "bg-secondary-fixed text-secondary",
      avatarLetters: "HK",
      room: "P.202 - Urban Heights",
      time: "15:00",
      date: "27/10/2023",
      status: "Chờ xác nhận",
      statusColor: "bg-secondary-container text-on-secondary-container"
    }
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch xem phòng</h1>
          <p className="text-sm text-slate-500">Quản lý và sắp xếp các cuộc hẹn xem phòng của khách hàng.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white py-2.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo lịch xem
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Khách hàng</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Phòng quan tâm</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Thời gian hẹn</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Người phụ trách</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {viewingRequests.map((req, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors duration-150 group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${req.avatarBg}`}>
                      {req.avatarLetters}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{req.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-slate-900">{req.room}</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">{req.time}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">{req.date}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-500">Admin</td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${req.statusColor}`}>
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Hiển thị 5 / 12 lịch hẹn</span>
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
              <span className="text-xs font-medium px-1">3</span>
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">Tạo lịch xem phòng</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 border-b border-slate-100/50">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên tòa nhà / Ký túc xá *</label>
                <input
                  list="dorm-list"
                  placeholder="Tìm kiếm hoặc chọn cơ sở..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-sm"
                />
                <datalist id="dorm-list">
                  <option value="KTX-001 - Diamond Residence" />
                  <option value="KTX-002 - Sky Central" />
                  <option value="KTX-003 - West Point" />
                </datalist>
                <p className="text-xs text-slate-400 mt-1.5 ml-1">Nhập từ khóa bất kỳ để tìm nhanh KTX.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Khách hàng *</label>
                <input
                  list="customer-list"
                  placeholder="Tìm kiếm khách hàng theo tên hoặc SĐT..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-sm"
                />
                <datalist id="customer-list">
                  <option value="Trần Minh Phát - 0901234567" />
                  <option value="Nguyễn Lê Mỹ Khôi - 0987654321" />
                  <option value="Đặng Thái Sơn - 0912345678" />
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày hẹn *</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Giờ hẹn *</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 flex gap-3 justify-end items-center">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg font-bold text-white bg-primary hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md shadow-primary/20"
              >
                Lên lịch hẹn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminViewing;
