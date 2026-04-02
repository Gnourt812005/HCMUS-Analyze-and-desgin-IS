import React from 'react';
import { Sidebar } from '../components/Sidebar';

const Contracts = () => {

  return (
    <main className="flex-grow pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">

        <Sidebar />

        {/* Main Content Canvas */}
        <div className="md:col-span-9">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <nav className="flex items-center gap-2 text-sm text-outline mb-2">
                <span>Người dùng</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-primary font-medium">Hợp đồng</span>
              </nav>
              <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Hợp đồng của tôi</h1>
            </div>
          </div>

          {/* Bento Grid of Contracts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contract Card 1 */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex flex-col group transition-all duration-300 hover:shadow-lg">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>contract</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full">Đang hiệu lực</span>
                </div>
                <h3 className="text-xl font-bold font-headline mb-1 text-on-surface">Phòng Premium A-102</h3>
                <p className="text-xs text-outline mb-6 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">pin_drop</span>
                  Quản lý và xem lại các hợp đồng thuê phòng hiện tại và trong quá khứ của bạn.
                </p>
                <div className="space-y-4 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-outline">Thời hạn thuê</span>
                    <span className="font-medium">01/01/2024 — 31/12/2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-outline">Giá thuê hàng tháng</span>
                    <span className="text-lg font-bold text-secondary">12.500.000đ</span>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button className="w-full py-3 border border-outline-variant/30 rounded-lg text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                  Xem hợp đồng
                  <span className="material-symbols-outlined text-sm">visibility</span>
                </button>
              </div>
            </div>

            {/* Contract Card 2 */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex flex-col group transition-all duration-300 hover:shadow-lg">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_storage</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full">Đang hiệu lực</span>
                </div>
                <h3 className="text-xl font-bold font-headline mb-1 text-on-surface">Căn hộ Dịch vụ Landmark 81</h3>
                <p className="text-xs text-outline mb-6 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">pin_drop</span>
                  Thời hạn thuê: 12 tháng, bắt đầu từ 01/01/2024.
                </p>
                <div className="space-y-4 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-outline">Thời hạn thuê</span>
                    <span className="font-medium">15/02/2024 — 15/02/2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-outline">Giá thuê hàng tháng</span>
                    <span className="text-lg font-bold text-secondary">2.200.000đ</span>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button className="w-full py-3 border border-outline-variant/30 rounded-lg text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                  Xem hợp đồng
                  <span className="material-symbols-outlined text-sm">visibility</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contracts;
