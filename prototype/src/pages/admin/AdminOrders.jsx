import React from 'react';

const AdminOrders = () => {
  const orders = [
    {
      id: "#ORD-2094",
      customer: "Nguyễn Văn Linh",
      phone: "0908 123 456",
      avatarBg: "bg-primary-fixed text-primary",
      avatarLetters: "NL",
      room: "B-302",
      amount: "4.500.000đ",
      status: "Cọc phòng",
      statusColor: "bg-blue-100 text-blue-800"
    },
    {
      id: "#ORD-2105",
      customer: "Minh Thảo",
      phone: "0912 888 999",
      avatarBg: "bg-secondary-fixed text-secondary",
      avatarLetters: "MT",
      room: "A-101",
      amount: "3.200.000đ",
      status: "Đã thuê",
      statusColor: "bg-emerald-100 text-emerald-800"
    },
    {
      id: "#ORD-2118",
      customer: "Phạm Khánh",
      phone: "0888 555 111",
      avatarBg: "bg-tertiary-fixed text-tertiary",
      avatarLetters: "PK",
      room: "C-504",
      amount: "2.800.000đ",
      status: "Cọc phòng",
      statusColor: "bg-blue-100 text-blue-800"
    },
    {
      id: "#ORD-2122",
      customer: "Hoàng Thiên",
      phone: "0707 999 000",
      avatarBg: "bg-slate-100 text-slate-900",
      avatarLetters: "HT",
      room: "B-201",
      amount: "5.100.000đ",
      status: "Đã thuê",
      statusColor: "bg-emerald-100 text-emerald-800"
    },
    {
      id: "#ORD-2130",
      customer: "Trần Diệp",
      phone: "0934 112 233",
      avatarBg: "bg-primary-fixed text-primary",
      avatarLetters: "TD",
      room: "A-412",
      amount: "4.000.000đ",
      status: "Trễ hạn",
      statusColor: "bg-error-container text-on-error-container"
    }
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Đơn hàng</h1>
          <p className="text-sm text-slate-500">Lưu trữ và theo dõi các giao dịch chờ thanh toán, đặt cọc và hợp đồng mới.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Mã đơn</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Khách hàng</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Phòng</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Số tiền</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-5 text-sm font-semibold text-primary">{order.id}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${order.avatarBg}`}>
                      {order.avatarLetters}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{order.customer}</p>
                      <p className="text-[11px] text-slate-500">{order.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 rounded bg-slate-100 text-slate-900 text-xs font-medium">{order.room}</span>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-secondary">
                  {order.amount}
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.statusColor}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Hiển thị 5 / 24 đơn hàng</span>
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
    </>
  );
};

export default AdminOrders;
