import React from 'react';
import toast from 'react-hot-toast';
import { Sidebar } from '../components/Sidebar';

const Profile = () => {
  const handleUpdate = (e) => {
    e.preventDefault();
    toast.success('Cập nhật thông tin thành công!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    toast.success('Đổi mật khẩu thành công!');
  };

  return (
    <main className="flex-grow pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">

        <Sidebar />

        {/* Profile Form Section */}
        <section className="md:col-span-9 space-y-8">
          <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 shadow-sm border border-outline-variant/10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="flex items-center space-x-8">
                {/* Large Avatar */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container shadow-inner bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300">person</span>
                  </div>
                  <button className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full border-4 border-surface-container-lowest shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </button>
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-1">Thông tin cá nhân</h1>
                  <p className="text-on-surface-variant text-sm flex items-center">
                    <span className="material-symbols-outlined text-xs mr-1 text-primary">verified</span>
                    Thành viên từ Tháng 10, 2023
                  </p>
                </div>
              </div>
            </div>

            {/* Information Form */}
            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">Họ và tên</label>
                  <input required className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="text" defaultValue="Người Dùng Mẫu" />
                </div>
                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">Số điện thoại</label>
                  <input required className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="tel" defaultValue="090 123 4567" />
                </div>
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">Email</label>
                  <input className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="email" defaultValue="user@example.com" />
                </div>
                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">Ngày sinh</label>
                  <input className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="date" defaultValue="1998-05-15" />
                </div>
                {/* ID Number */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">CCCD/CMND</label>
                  <input className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="text" defaultValue="012345678901" />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center space-x-2">
                  <span>Cập nhật thông tin</span>
                  <span className="material-symbols-outlined text-sm">save</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-secondary-container p-2 rounded-lg">
                <span className="material-symbols-outlined text-on-secondary-container">lock_reset</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface">Bảo mật &amp; Mật khẩu</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">Mật khẩu hiện tại</label>
                <input required className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary transition-all" placeholder="••••••••" type="password" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">Mật khẩu mới</label>
                <input required className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary transition-all" placeholder="••••••••" type="password" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-surface-container-lowest text-secondary border border-secondary/20 px-6 py-3 rounded-lg text-sm font-bold hover:bg-secondary hover:text-on-secondary transition-all">
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>
    </main>
  );
};

export default Profile;
