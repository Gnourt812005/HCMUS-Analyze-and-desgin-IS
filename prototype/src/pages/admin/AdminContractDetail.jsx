import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AdminContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isCreateMode = id === 'create';

  // Mock initial state data
  const [formData, setFormData] = useState({
    contractId: isCreateMode ? '' : 'HD-2023-001',
    customerName: isCreateMode ? '' : 'Nguyễn Văn A',
    facility: isCreateMode ? '' : 'KTX-001 - Diamond Residence',
    room: isCreateMode ? '' : 'P101',
    startDate: isCreateMode ? '' : '2023-09-01',
    endDate: isCreateMode ? '' : '2024-09-01',
    deposit: isCreateMode ? '' : '5,000,000',
    price: isCreateMode ? '' : '2,500,000',
    status: isCreateMode ? 'Nháp' : 'Hiệu lực',
    notes: isCreateMode ? '' : 'Khách hàng cam kết thuê đủ 12 tháng. Tiền cọc sẽ được hoàn trả sau khi thanh lý hợp đồng hợp lệ.',
    image: isCreateMode
      ? 'https://placehold.co/600x800/f8fafc/cbd5e1?text=Upload+Contract+Scan'
      : 'https://placehold.co/600x800/e2e8f0/94a3b8?text=Scanned+Document'
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/contracts')}
            className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {isCreateMode ? 'Tạo hợp đồng mới' : `Chi tiết hợp đồng: ${formData.contractId}`}
              </h1>
              {!isCreateMode && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  {formData.status}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 tracking-wide mt-1">
              {isCreateMode ? 'Nhập thông tin giao dịch để thiết lập hợp đồng thuê mới' : `Theo dõi hiệu lực, kỳ hạn và các điều khoản giao dịch của hợp đồng`}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/contracts')}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Hủy bỏ
          </button>
          <button className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">contract</span>
            {isCreateMode ? 'Ký hợp đồng' : 'Lưu cập nhật'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Left Column (1/3): Contract Scan Image */}
          <div className="md:col-span-1 flex flex-col gap-4 border-r border-slate-100 pr-8">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">Bản scan hợp đồng</h3>
            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-slate-300 relative group cursor-pointer transition-colors hover:border-primary">
              <img className="w-full h-full object-cover grayscale" src={formData.image} alt="Contract" />
              <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-3xl mb-2">cloud_upload</span>
                <span className="text-white font-bold text-sm">Tải bản scan</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Hỗ trợ PDF (trang đầu), JPG hoặc PNG.
            </p>
          </div>

          {/* Right Column (2/3): Form Inputs */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">Thông tin giao kèo</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã hợp đồng <span className="text-slate-400 font-normal ml-1">(Tự sinh)</span></label>
                <input
                  type="text"
                  defaultValue={formData.contractId}
                  disabled
                  placeholder="Hệ thống tự động cấp mã..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none transition-all text-sm font-mono text-slate-500 bg-slate-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Trạng thái hiệu lực</label>
                <select
                  defaultValue={formData.status}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium bg-white"
                >
                  <option value="Nháp">Bản nháp</option>
                  <option value="Hiệu lực">Đang hiệu lực</option>
                  <option value="Sắp hết hạn">Sắp hết hạn</option>
                  <option value="Đã thanh lý">Đã thanh lý</option>
                  <option value="Đã hủy">Đã hủy bỏ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Khách hàng đại diện <span className="text-red-500">*</span></label>
              <input
                list="customer-list"
                defaultValue={formData.customerName}
                placeholder="Tìm kiếm khách thuê..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium bg-white"
              />
              <datalist id="customer-list">
                <option value="Nguyễn Văn A - 0901234567" />
                <option value="Trần Thị B - 0987654321" />
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Cơ sở (KTX) <span className="text-red-500">*</span></label>
                <input
                  list="facility-list"
                  defaultValue={formData.facility}
                  placeholder="Chọn tòa nhà..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium bg-white"
                />
                <datalist id="facility-list">
                  <option value="KTX-001 - Diamond Residence" />
                  <option value="KTX-002 - Sky Central" />
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã phòng <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  defaultValue={formData.room}
                  placeholder="Ví dụ: P101"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày bắt đầu <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  defaultValue={formData.startDate}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày hết hạn <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  defaultValue={formData.endDate}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tiền cọc (₫) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  defaultValue={formData.deposit}
                  placeholder="Ví dụ: 5,000,000"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tiền thuê hàng tháng (₫) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  defaultValue={formData.price}
                  placeholder="Ví dụ: 2,500,000"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú & Điều khoản riêng</label>
              <textarea
                defaultValue={formData.notes}
                rows={3}
                placeholder="Nhập thông tin bổ sung, hình thức thanh toán, thời hạn gia hạn..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminContractDetail;
