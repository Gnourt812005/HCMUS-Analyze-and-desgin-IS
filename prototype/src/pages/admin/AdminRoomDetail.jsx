import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AdminRoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isCreateMode = id === 'create';

  // Mock initial state data
  const [formData, setFormData] = useState({
    roomNumber: isCreateMode ? '' : 'P201',
    facility: isCreateMode ? '' : 'KTX-001 - Diamond Residence',
    price: isCreateMode ? '' : '2,500,000',
    capacity: isCreateMode ? '' : '4',
    type: isCreateMode ? '' : 'Phòng tiêu chuẩn',
    status: isCreateMode ? 'Trống' : 'Còn trống 1 gường',
    description: isCreateMode ? '' : 'Phòng rộng rãi, có cửa sổ thoáng mát, view đẹp nhìn ra trung tâm thành phố.',
    image: isCreateMode
      ? 'https://placehold.co/600x400/f8fafc/cbd5e1?text=Upload+Image'
      : 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Room+preview'
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/rooms')}
            className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {isCreateMode ? 'Thêm mới phòng' : `Chi tiết phòng ${formData.roomNumber}`}
              </h1>
              {!isCreateMode && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30">
                  {formData.status}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 tracking-wide mt-1">
              {isCreateMode ? 'Nhập thông tin cho phòng mới để thêm vào hệ thống' : 'Quản lý thông tin chung và cấu hình cho phòng'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/rooms')}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Hủy bỏ
          </button>
          <button className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">save</span>
            {isCreateMode ? 'Tạo phòng' : 'Lưu cập nhật'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Left Column (1/3): Image Upload */}
          <div className="md:col-span-1 flex flex-col gap-4 border-r border-slate-100 pr-8">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">Hình ảnh phòng</h3>
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed border-slate-300 relative group cursor-pointer transition-colors hover:border-primary">
              <img className="w-full h-full object-cover grayscale" src={formData.image} alt="Room" />
              <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-3xl mb-2">cloud_upload</span>
                <span className="text-white font-bold text-sm">Tải ảnh lên</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Hỗ trợ JPG, PNG hoặc WEBP. <br />Kích thước đề xuất 800x600px.
            </p>
          </div>

          {/* Right Column (2/3): Room Details Form */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">Thông tin cơ bản</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Số / Tên phòng <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  defaultValue={formData.roomNumber}
                  placeholder="Ví dụ: P101"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Thuộc cơ sở (KTX) <span className="text-red-500">*</span></label>
                <select
                  defaultValue={formData.facility}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium bg-white"
                >
                  <option value="" disabled>Chọn cơ sở</option>
                  <option value="KTX-001 - Diamond Residence">KTX-001 - Diamond Residence</option>
                  <option value="KTX-002 - Sky Central">KTX-002 - Sky Central</option>
                  <option value="KTX-003 - West Point">KTX-003 - West Point</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Loại phòng <span className="text-red-500">*</span></label>
                <select
                  defaultValue={formData.type}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium bg-white"
                >
                  <option value="" disabled>Chọn phân loại</option>
                  <option value="Phòng tiêu chuẩn">Phòng tiêu chuẩn (Standard)</option>
                  <option value="Phòng cao cấp">Phòng cao cấp (Premium)</option>
                  <option value="Phòng Studio">Phòng Studio</option>
                  <option value="Căn hộ dịch vụ">Căn hộ dịch vụ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Sức chứa (Người) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  defaultValue={formData.capacity}
                  placeholder="Ví dụ: 4"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Giá cho thuê (₫/tháng) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  defaultValue={formData.price}
                  placeholder="Ví dụ: 2,500,000"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Trạng thái phòng</label>
                <select
                  defaultValue={formData.status}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium bg-white"
                >
                  <option value="Trống">Trống hoàn toàn</option>
                  <option value="Còn trống 1 gường">Còn trống 1 giường</option>
                  <option value="Còn trống 2 gường">Còn trống 2 giường</option>
                  <option value="Đã đầy">Đã đầy người</option>
                  <option value="Đang bảo trì">Đang bảo trì/sửa chữa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả phòng</label>
              <textarea
                defaultValue={formData.description}
                rows={4}
                placeholder="Nhập mô tả chi tiết, trang bị, và các dịch vụ đi kèm..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminRoomDetail;
