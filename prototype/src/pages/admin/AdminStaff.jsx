import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminStaff = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const staffMembers = [
    {
      name: "Lê Thu Hà",
      email: "ha.le@arch-digital.vn",
      role: "Quản lý cơ sở",
      status: "Đang làm việc",
      statusColor: "bg-green-100 text-green-800",
      avatarBg: "bg-surface-variant",
      avatarInitials: "LH"
    },
    {
      name: "Nguyễn Minh Tuấn",
      email: "tuan.nguyen@arch-digital.vn",
      role: "Kế toán",
      status: "Đang làm việc",
      statusColor: "bg-green-100 text-green-800",
      avatarBg: "bg-primary-fixed text-primary",
      avatarInitials: "NT"
    },
    {
      name: "Trần Bảo Anh",
      email: "anh.tran@arch-digital.vn",
      role: "Nhân viên kinh doanh",
      status: "Nghỉ phép",
      statusColor: "bg-secondary-container/20 text-on-secondary-container",
      avatarBg: "bg-secondary-fixed text-secondary",
      avatarInitials: "TA"
    },
    {
      name: "Phạm Hoàng Nam",
      email: "nam.pham@arch-digital.vn",
      role: "Kỹ thuật viên",
      status: "Đang làm việc",
      statusColor: "bg-green-100 text-green-800",
      avatarBg: "bg-tertiary-fixed text-tertiary",
      avatarInitials: "PN"
    },
    {
      name: "Vũ Đức Long",
      email: "long.vu@arch-digital.vn",
      role: "Bảo vệ",
      status: "Nghỉ việc",
      statusColor: "bg-error-container/40 text-on-error-container",
      avatarBg: "bg-slate-100 text-slate-900",
      avatarInitials: "VL"
    },
    {
      name: "Đặng Kim Chi",
      email: "chi.dang@arch-digital.vn",
      role: "Lễ tân",
      status: "Đang làm việc",
      statusColor: "bg-green-100 text-green-800",
      avatarBg: "bg-primary-fixed text-primary",
      avatarInitials: "DC"
    }
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách nhân viên</h1>
          <p className="text-sm text-slate-500">Quản lý và cấp quyền truy cập cho nhân sự hệ thống.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white py-2.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm nhân viên
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Avatar</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Tên nhân viên</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Email</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Vai trò</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {staffMembers.map((staff, idx) => (
              <tr
                key={idx}
                onClick={() => navigate(`/admin/staff/NV-00${idx + 1}`)}
                className="hover:bg-slate-50 transition-colors duration-150 group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${staff.avatarBg}`}>
                    {staff.avatarInitials}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-manrope font-bold text-slate-900 body-md">{staff.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-500 font-body body-md">{staff.email}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-900 font-medium body-md">{staff.role}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${staff.statusColor}`}>
                    {staff.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Hiển thị 6 / 42 nhân viên</span>
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
              <h3 className="text-xl font-bold text-slate-900">Thêm nhân viên mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email *</label>
                <input type="email" placeholder="example@arch-digital.vn" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu *</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Xác nhận mật khẩu *</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                Hủy bỏ
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg font-bold text-white bg-primary hover:opacity-90 transition-opacity shadow-sm">
                Tạo tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminStaff;
