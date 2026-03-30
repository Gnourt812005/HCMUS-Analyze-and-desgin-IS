import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AdminStaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data for the demonstration
  const staff = {
    id: id || "NV-001",
    name: "Lê Thu Hà",
    email: "ha.le@arch-digital.vn",
    phone: "0901 234 567",
    role: "Quản lý cơ sở",
    status: "Đang làm việc",
    statusColor: "bg-green-100 text-green-800",
    avatarBg: "bg-surface-variant text-slate-600",
    avatarInitials: "LH",
    joinDate: "15/05/2023",
    department: "Vận hành",
    address: "Quận Cầu Giấy, Hà Nội"
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/staff')}
          className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-all flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Chi tiết nhân viên</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${staff.statusColor}`}>
              {staff.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 tracking-wide mt-1">Thông tin chi tiết và hồ sơ của nhân sự</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Left Column: Avatar Only */}
          <div className="flex flex-col items-center justify-center border-r border-slate-100 pr-12 min-h-[300px]">
            <div className={`w-64 h-64 rounded-full flex items-center justify-center text-7xl font-bold shadow-inner ${staff.avatarBg}`}>
              {staff.avatarInitials}
            </div>
            <h2 className="mt-8 text-2xl font-bold text-slate-900">{staff.name}</h2>
            <p className="text-primary font-semibold text-lg">{staff.role}</p>
          </div>

          {/* Right Column: Staff Info Rows */}
          <div className="flex flex-col justify-center gap-6 text-sm">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-2 mb-2">Thông tin liên hệ & Hồ sơ</h3>

            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-slate-500 font-medium">Mã nhân viên</span>
              <span className="col-span-2 font-semibold text-slate-900 font-mono">{staff.id}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-slate-500 font-medium">Email</span>
              <span className="col-span-2 font-medium text-slate-900">{staff.email}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-slate-500 font-medium">Số điện thoại</span>
              <span className="col-span-2 font-medium text-slate-900">{staff.phone}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-slate-500 font-medium">Phòng ban</span>
              <span className="col-span-2 font-medium text-slate-900">{staff.department}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-slate-500 font-medium">Ngày vào làm</span>
              <span className="col-span-2 font-medium text-slate-900">{staff.joinDate}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-slate-500 font-medium">Địa chỉ</span>
              <span className="col-span-2 font-medium text-slate-900">{staff.address}</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminStaffDetail;
