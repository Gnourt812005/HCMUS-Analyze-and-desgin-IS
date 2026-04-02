import React from 'react';
import { Sidebar } from '../components/Sidebar';

const ViewingHistory = () => {
  return (
    <main className="flex-grow pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        <Sidebar />

        <section className="md:col-span-9 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Lịch sử xem phòng</h1>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant/10">
              <h3 className="text-lg font-bold text-on-surface">Danh sách chi tiết</h3>
              <p className="text-sm text-outline">Theo dõi trạng thái và chi tiết các lịch hẹn xem phòng của bạn.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-outline">Mã đơn</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-outline">Tên phòng</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-outline">Ngày &amp; Giờ xem</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-outline">Trạng thái</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-outline text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  <tr className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="font-mono text-sm font-semibold text-primary">#VX123</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high">
                          <img alt="Phòng Studio Modern" className="w-full h-full object-cover" src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image" />
                        </div>
                        <span className="font-semibold text-sm">Phòng Studio Hiện Đại</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm">
                        <p className="font-semibold">15 Tháng 10, 2024</p>
                        <p className="text-outline text-xs">14:30 - 15:30</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">Chờ xác nhận</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-error font-semibold text-sm hover:underline underline-offset-4 decoration-2">Hủy lịch</button>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="font-mono text-sm font-semibold text-primary">#VX124</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high">
                          <img alt="Deluxe" className="w-full h-full object-cover" src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Image" />
                        </div>
                        <span className="font-semibold text-sm">Phòng Studio Hiện Đại</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm">
                        <p className="font-semibold">16 Tháng 10, 2024</p>
                        <p className="text-outline text-xs">09:00 - 10:00</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Đã chốt</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-outline/40 cursor-not-allowed font-semibold text-sm" disabled>Hủy lịch</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-8 py-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex items-center justify-between">
              <p className="text-xs text-outline font-medium">Hiển thị 2 cuộc hẹn</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ViewingHistory;
