import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AdminFacilityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isCreateMode = id === 'create';

  // Mock initial state data
  const [formData, setFormData] = useState({
    code: isCreateMode ? '' : 'KTX-001',
    name: isCreateMode ? '' : 'Cơ sở Diamond Residence',
    address: isCreateMode ? '' : '123 Đường Trần Duy Hưng, Cầu Giấy, Hà Nội',
    rooms: isCreateMode ? '' : '45',
    status: isCreateMode ? 'Đang hoạt động' : 'Đang hoạt động',
    description: isCreateMode ? '' : 'Tòa nhà phức hợp cao cấp với tiện ích nội khu đầy đủ bao gồm siêu thị, phòng gym và bể bơi.',
    image: isCreateMode
      ? 'https://placehold.co/600x400/f8fafc/cbd5e1?text=Upload+Building+Image'
      : 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Building+1'
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/facilities')}
            className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {isCreateMode ? 'Thêm mới cơ sở' : `Chi tiết cơ sở: ${formData.name}`}
              </h1>
              {!isCreateMode && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  {formData.status}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 tracking-wide mt-1">
              {isCreateMode ? 'Điền thông tin để đăng ký một cơ sở ký túc xá mới vào hệ thống' : `Quản lý thông tin chung và cấu hình cho mã ${formData.code}`}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/facilities')}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Hủy bỏ
          </button>
          <button className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">domain_add</span>
            {isCreateMode ? 'Tạo cơ sở' : 'Lưu cập nhật'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Left Column (1/3): Image Upload */}
          <div className="md:col-span-1 flex flex-col gap-4 border-r border-slate-100 pr-8">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">Hình ảnh cơ sở</h3>
            <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-300 relative group cursor-pointer transition-colors hover:border-primary">
              <img className="w-full h-full object-cover grayscale" src={formData.image} alt="Building" />
              <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-3xl mb-2">cloud_upload</span>
                <span className="text-white font-bold text-sm">Tải ảnh lên</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Hỗ trợ JPG, PNG hoặc WEBP. <br />Kích thước đề xuất 800x800px.
            </p>
          </div>

          {/* Right Column (2/3): Facility Details Form */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">Thông tin cơ bản</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã cơ sở (KTX) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  defaultValue={formData.code}
                  placeholder="Ví dụ: KTX-005"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-mono text-primary font-bold bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên cơ sở <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  defaultValue={formData.name}
                  placeholder="Ví dụ: Cơ sở Green View"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Địa chỉ đầy đủ <span className="text-red-500">*</span></label>
              <input
                type="text"
                defaultValue={formData.address}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tổng số phòng <span className="text-slate-400 font-normal ml-1">(auto hoặc nhập)</span></label>
                <input
                  type="number"
                  defaultValue={formData.rooms}
                  placeholder="Ví dụ: 45"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Trạng thái hoạt động</label>
                <select
                  defaultValue={formData.status}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium bg-white"
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Đang sửa chữa">Đang sửa chữa/Bảo trì</option>
                  <option value="Tạm ngưng">Tạm ngưng</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả và tiện ích khu vực</label>
              <textarea
                defaultValue={formData.description}
                rows={4}
                placeholder="Nhập thông tin mô tả chi tiết vị trí cơ sở, các tiện ích xung quanh..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminFacilityDetail;
