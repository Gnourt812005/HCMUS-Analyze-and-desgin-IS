import React, { useEffect, useState } from 'react';
import { CustomerSidebar } from '../components/CustomerSidebar';
import { ApiClient } from '../api/ApiClient';
import { UserProfileDTO, UserRole } from '@dormarch/shared';

export const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await ApiClient.get<UserProfileDTO>('/users/profile');
      setProfile(data);
    } catch (err: any) {
      alert(err.message || 'Không thể load được dữ liệu!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await ApiClient.put('/users/profile', { body: JSON.stringify(profile) });
      alert('Cập nhật thông tin thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');

    try {
      await ApiClient.patch('/users/profile/password', {
        body: JSON.stringify({ oldPassword, newPassword })
      });
      alert('Đổi mật khẩu thành công!');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert(err.message || 'Lỗi đổi mật khẩu');
    }
  };

  if (isLoading) return <div className="text-center p-24 text-slate-500 font-medium">Đang tải cấu hình...</div>;
  if (!profile) return <div className="text-center p-24 text-red-500 font-bold">Chưa đăng nhập!</div>;

  const isStaff = profile.role === UserRole.STAFF;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 px-6">

      {!isStaff && <CustomerSidebar />}

      {/* Profile Form Section */}
      <section className={`${isStaff ? 'md:col-span-12 max-w-4xl mx-auto w-full' : 'md:col-span-9'} space-y-8`}>
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
                  {isStaff ? 'Quản trị viên / Nhân viên' : 'Khách hàng hiện tại'}
                </p>
              </div>
            </div>
          </div>

          {/* Information Form */}
          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1.5">
                <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">Họ và tên</label>
                <input required value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="text" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">Số điện thoại</label>
                <input required value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="tel" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">Email</label>
                <input disabled value={profile.email} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm text-slate-500 cursor-not-allowed transition-all" type="email" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">Ngày sinh</label>
                <input value={profile.birthday || ''} onChange={e => setProfile({ ...profile, birthday: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="date" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">CCCD/CMND</label>
                <input value={profile.cccd || ''} onChange={e => setProfile({ ...profile, cccd: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="text" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">Địa chỉ</label>
                <input value={profile.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="text" />
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
              <input required name="oldPassword" minLength={6} className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary transition-all" placeholder="••••••••" type="password" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline">Mật khẩu mới</label>
              <input required name="newPassword" minLength={6} className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary transition-all" placeholder="••••••••" type="password" />
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
  );
};
