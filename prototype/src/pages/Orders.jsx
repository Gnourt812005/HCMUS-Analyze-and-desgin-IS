import React from 'react';
import { Sidebar } from '../components/Sidebar';

const Orders = () => {
  return (
    <main className="flex-grow pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        <Sidebar />

        <section className="md:col-span-9">
          {/* Header Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Quản lý Đơn của tôi</h1>
              <p className="text-on-surface-variant text-base">Theo dõi và quản lý các yêu cầu đặt phòng của bạn một cách kiến trúc.</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container p-1 rounded-xl">
              <button className="px-6 py-2.5 rounded-lg text-sm font-bold bg-surface-container-lowest text-primary shadow-sm transition-all">Đơn Đặt Cọc</button>
              <button className="px-6 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary transition-all">Đơn Đăng Ký Thuê</button>
            </div>
          </div>

          {/* Dashboard Content: Data Table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
            {/* Table Header/Filters */}
            <div className="px-6 py-5 flex flex-col md:flex-row justify-between items-center border-b border-outline-variant/10 gap-4">
              <div className="relative w-full md:w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                <input className="w-full pl-10 pr-4 py-2 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Tìm kiếm mã đơn, tên phòng..." type="text" />
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-6 py-4 text-[0.6875rem] font-bold text-outline uppercase tracking-wider">Mã đơn</th>
                    <th className="px-6 py-4 text-[0.6875rem] font-bold text-outline uppercase tracking-wider">Tên phòng</th>
                    <th className="px-6 py-4 text-[0.6875rem] font-bold text-outline uppercase tracking-wider">Số giường</th>
                    <th className="px-6 py-4 text-[0.6875rem] font-bold text-outline uppercase tracking-wider">Tổng tiền</th>
                    <th className="px-6 py-4 text-[0.6875rem] font-bold text-outline uppercase tracking-wider">Ngày giao dịch</th>
                    <th className="px-6 py-4 text-[0.6875rem] font-bold text-outline uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-[0.6875rem] font-bold text-outline uppercase tracking-wider text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  <tr className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-5 text-sm font-bold text-primary">#DA-9921</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-on-surface">Luxury Studio A1</span>
                        <span className="text-xs text-outline">Khu đô thị Azure, Tòa S1</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium">01 Giường</td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-secondary">2.500.000đ</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">12/10/2023</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Đã thanh toán</span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button className="text-primary hover:underline text-sm font-bold">Xem chi tiết</button>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-5 text-sm font-bold text-primary">#DA-8842</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-on-surface">Standard Duo B4</span>
                        <span className="text-xs text-outline">Làng Đại học, Block C</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium">02 Giường</td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-secondary">1.200.000đ</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">15/10/2023</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-container/20 text-on-secondary-container">Đang chờ</span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-3">
                      <button className="text-primary hover:underline text-sm font-bold">Xem chi tiết</button>
                      <button className="text-error hover:underline text-sm font-bold ml-2">Hủy cọc</button>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-5 text-sm font-bold text-primary">#DA-7710</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-on-surface">Penthouse Dorm X</span>
                        <span className="text-xs text-outline">Trung tâm Q1, Tòa G</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium">01 Giường</td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-secondary">5.000.000đ</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">05/10/2023</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-container/40 text-error">Đã hủy</span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button className="text-primary hover:underline text-sm font-bold">Xem chi tiết</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/10">
              <p className="text-xs text-outline font-medium">Hiển thị 3 đơn đặt cọc</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Orders;
