import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerSidebar } from '../components/CustomerSidebar';
import { ApiClient } from '../api/ApiClient';
import { CheckoutRequestDTO, UserProfileDTO, ContractDTO } from '@dormarch/shared';

interface CheckoutForm {
  contractId: string;
  expectedDate: string;
  documentFile: File | null;
}

export const CreateCheckoutRequestPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [activeContracts, setActiveContracts] = useState<ContractDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [documentFileName, setDocumentFileName] = useState('');
  const [selectedContractDetails, setSelectedContractDetails] = useState<ContractDTO | null>(null);

  const [form, setForm] = useState<CheckoutForm>({
    contractId: '',
    expectedDate: '',
    documentFile: null,
  });

  // Load profile and active contracts on mount
  useEffect(() => {
    const abortController = new AbortController();
    loadProfileAndContracts(abortController);
    
    return () => {
      abortController.abort();
    };
  }, []);

  const loadProfileAndContracts = async (abortController: AbortController) => {
    try {
      setLoading(true);
      setError(null);

      // Load user profile
      const profileData = await ApiClient.get<UserProfileDTO>('/users/profile');
      
      if (abortController.signal.aborted) return;
      
      setProfile(profileData);

      // Load all contracts for the customer
      const allContracts = await ApiClient.get<ContractDTO[]>('/contracts');
      
      if (abortController.signal.aborted) return;
      
      // Filter active contracts for this customer
      if (profileData.cccd) {
        const customerContracts = allContracts.filter(
          (contract: ContractDTO) => 
            contract.userCCCD === profileData.cccd && 
            contract.status === 'ACTIVE'
        );
        setActiveContracts(customerContracts);
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        setError(
          err instanceof Error 
            ? err.message 
            : 'Lỗi tải thông tin. Vui lòng thử lại sau.'
        );
        setActiveContracts([]);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  // Load contract details when contract is selected
  useEffect(() => {
    if (form.contractId) {
      const selected = activeContracts.find(c => c.contractId === form.contractId);
      setSelectedContractDetails(selected || null);
    } else {
      setSelectedContractDetails(null);
    }
  }, [form.contractId, activeContracts]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Tệp quá lớn (tối đa 10MB). Vui lòng chọn tệp khác.');
        return;
      }

      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setError('Loại tệp không được hỗ trợ. Vui lòng chọn PDF, JPG, PNG, DOC hoặc DOCX.');
        return;
      }

      setForm({ ...form, documentFile: file });
      setDocumentFileName(file.name);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!profile) {
      setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    if (!form.contractId) {
      setError('Vui lòng chọn phòng/giường cần trả.');
      return;
    }

    if (!form.expectedDate) {
      setError('Vui lòng chọn ngày dự kiến trả phòng.');
      return;
    }

    if (!form.documentFile) {
      setError('Vui lòng đính kèm hợp đồng hoặc phiếu đặt cọc.');
      return;
    }

    // Validate expected date is in the future
    const selectedDate = new Date(form.expectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate <= today) {
      setError('Ngày dự kiến trả phòng phải là ngày trong tương lai.');
      return;
    }

    try {
      setSubmitting(true);

      // Convert file to base64
      let documentUrl = '';
      if (form.documentFile) {
        documentUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(form.documentFile!);
        });
      }

      // Create checkout request
      const newRequest = await ApiClient.post<CheckoutRequestDTO>('/checkout-requests', {
        body: JSON.stringify({
          userCCCD: profile.cccd,
          contractId: form.contractId,
          expectedDate: form.expectedDate,
          documentUrl,
        })
      });

      setSuccess(true);
      setForm({
        contractId: '',
        expectedDate: '',
        documentFile: null,
      });
      setDocumentFileName('');

      // Redirect to checkout requests page after 2 seconds
      setTimeout(() => {
        navigate('/checkout-requests');
      }, 2000);

    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : 'Lỗi tạo yêu cầu trả phòng. Vui lòng thử lại sau.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 px-6 py-8">
        <CustomerSidebar />
        <section className="md:col-span-9">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="text-center text-slate-500 py-16">Đang tải thông tin...</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 px-6 py-8">
      <CustomerSidebar />

      <section className="md:col-span-9 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Tạo yêu cầu trả phòng</h1>
              <p className="text-sm text-slate-500 mt-1">Điền đầy đủ thông tin và đính kèm giấy tờ cần thiết</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-4">
            Yêu cầu trả phòng của bạn sẽ được ghi nhận với trạng thái <span className="font-semibold inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">Chờ xử lý</span> và sẽ được tự động gửi đến tài khoản của nhân viên quản lý.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
              <div>
                <p className="font-semibold text-green-900">Gửi yêu cầu thành công!</p>
                <p className="text-sm text-green-700 mt-1">Yêu cầu trả phòng của bạn đã được ghi nhận vào hệ thống. Bạn sẽ được chuyển hướng đến danh sách yêu cầu...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600 mt-0.5">error</span>
              <div>
                <p className="font-semibold text-red-900">Có lỗi xảy ra</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Prerequisites Check */}
        {!loading && activeContracts.length === 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 mt-0.5">info</span>
              <div>
                <p className="font-semibold text-amber-900">Không có hợp đồng hoạt động</p>
                <p className="text-sm text-amber-700 mt-1">
                  Khách hàng cần phải đã đăng nhập thành công và đang có hợp đồng thuê phòng/giường còn hiệu lực trên hệ thống để có thể tạo yêu cầu trả phòng.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        {activeContracts.length > 0 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 space-y-6">
            
            {/* Step 1: Select Room/Bed */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">1</span>
                  Chọn phòng/giường cần trả
                </h2>
                <p className="text-sm text-slate-500 mt-2">Danh sách phòng/giường hiện tại đang thuê</p>
              </div>

              <div className="grid gap-3">
                {activeContracts.map((contract) => (
                  <label
                    key={contract.contractId}
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      form.contractId === contract.contractId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="roomSelection"
                      value={contract.contractId}
                      checked={form.contractId === contract.contractId}
                      onChange={(e) => setForm({ ...form, contractId: e.target.value })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        Hợp đồng {contract.contractId} - Phòng {contract.roomId}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Ngày bắt đầu: {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-sm text-slate-600">
                        Thời hạn thuê: {contract.stayDuration} tháng
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Expected Date */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">2</span>
                  Chọn ngày dự kiến trả phòng
                </h2>
                <p className="text-sm text-slate-500 mt-2">Ngày bạn dự kiến trả phòng</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Ngày dự kiến trả phòng *
                </label>
                <input
                  type="date"
                  value={form.expectedDate}
                  onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">Ngày trả phòng phải là ngày trong tương lai</p>
              </div>
            </div>

            {/* Step 3: Upload Document */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">3</span>
                  Tải lên hợp đồng hoặc phiếu đặt cọc
                </h2>
                <p className="text-sm text-slate-500 mt-2">Đính kèm hợp đồng hoặc phiếu đặt cọc</p>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
                <input
                  id="checkout-document-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label
                  htmlFor="checkout-document-upload"
                  className="cursor-pointer inline-flex flex-col items-center gap-2 w-full"
                >
                  <span className="material-symbols-outlined text-5xl text-blue-500">cloud_upload</span>
                  <span className="font-semibold text-slate-700">Chọn tệp để tải lên</span>
                  <span className="text-sm text-slate-500">
                    Hỗ trợ: PDF, JPG, PNG, DOC, DOCX (tối đa 10MB)
                  </span>
                </label>
              </div>

              {documentFileName && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                    <div>
                      <p className="text-sm font-semibold text-green-900">Tệp đã chọn</p>
                      <p className="text-sm text-green-700 mt-1">{documentFileName}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Contract Details */}
            {selectedContractDetails && (
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Thông tin chi tiết hợp đồng</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Mã hợp đồng</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedContractDetails.contractId}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Phòng/Giường</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedContractDetails.roomId}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Số tiền cọc</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedContractDetails.depositAmount || 0)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Thời hạn</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedContractDetails.stayDuration} tháng</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="border-t border-slate-200 pt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/checkout-requests')}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </form>
        )}

        {/* Footer Help Text */}
        {activeContracts.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Thông tin hữu ích</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Yêu cầu trả phòng sẽ được ghi nhận với trạng thái <strong>Chờ xử lý</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Yêu cầu sẽ được tự động thông báo cho nhân viên quản lý</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Bạn có thể hủy yêu cầu chỉ khi nó còn ở trạng thái <strong>Chờ xử lý</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Hợp đồng hoặc phiếu đặt cọc là bắt buộc để hoàn thành yêu cầu</span>
              </li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};

export default CreateCheckoutRequestPage;
