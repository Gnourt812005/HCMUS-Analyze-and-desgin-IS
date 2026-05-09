import { useEffect, useState, FormEvent} from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '../api/ApiClient';
import { CheckoutRequestDTO, UserProfileDTO, RentalFormDTO } from '@dormarch/shared';

interface CheckoutForm {
  rentalFormId: string;
  expectedDate: string;
}

export const CreateCheckoutRequest = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [activeContracts, setActiveContracts] = useState<RentalFormDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedContractDetails, setSelectedContractDetails] = useState<RentalFormDTO | null>(null);

  const [form, setForm] = useState<CheckoutForm>({
    rentalFormId: '',
    expectedDate: '',
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

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

      const rentalForms = await ApiClient.get<RentalFormDTO[]>('/checkout-requests/rental-forms/available');
      
      if (abortController.signal.aborted) return;
      setActiveContracts(rentalForms);
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

  // Load rental form details when selected
  useEffect(() => {
    if (form.rentalFormId) {
      const selected = activeContracts.find(c => c.rental_form_id === form.rentalFormId);
      setSelectedContractDetails(selected || null);
    } else {
      setSelectedContractDetails(null);
    }
  }, [form.rentalFormId, activeContracts]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!profile) {
      setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    if (!form.rentalFormId) {
      setError('Vui lòng chọn phòng/giường cần trả.');
      return;
    }

    if (!form.expectedDate) {
      setError('Vui lòng chọn ngày dự kiến trả phòng.');
      return;
    }

    // Validate expected date is in the future
    const [year, month, day] = form.expectedDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate <= today) {
      setError('Ngày dự kiến trả phòng phải là ngày trong tương lai.');
      return;
    }

    try {
      setSubmitting(true);

      await ApiClient.post<CheckoutRequestDTO>('/checkout-requests', {
        body: JSON.stringify({
          userEmail: profile.email,
          rentalFormId: form.rentalFormId,
          expectedDate: form.expectedDate,
        })
      });

      showSuccess('Gửi yêu cầu thành công!');
      setForm({ rentalFormId: '', expectedDate: '' });
      setTimeout(() => {
        navigate('/checkout-requests');
      }, 1500);

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
        <section>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="text-center text-slate-500 py-16">Đang tải thông tin...</div>
          </div>
        </section>
    );
  }

  return (
    <section className="space-y-6">
        {successMsg && (
          <div className="fixed top-6 right-6 z-[60] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl transition-all">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="fixed top-6 right-6 z-[60] flex items-center gap-3 bg-red-600 text-white px-5 py-3.5 rounded-xl shadow-xl transition-all">
            <span className="material-symbols-outlined text-lg">error</span>
            <span className="text-sm font-semibold">{error}</span>
            <button onClick={() => setError(null)} className="ml-2 hover:text-red-200 transition-colors p-1 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

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

        {!loading && activeContracts.length === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 mt-0.5">info</span>
              <div>
                <p className="font-semibold text-amber-900">Không có đơn đăng ký thuê hợp lệ</p>
                <p className="text-xs text-amber-800 mt-1">
                  Khách hàng cần phải có đơn đăng ký thuê còn hiệu lực/chưa kèm yêu cầu trả phòng trên hệ thống để có thể tạo yêu cầu trả phòng.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeContracts.length > 0 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 space-y-6">
            
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">1</span>
                  Chọn phòng/giường cần trả
                </h2>
                <p className="text-sm text-slate-500 mt-2">Danh sách phòng/giường hiện tại đang thuê</p>
              </div>

              <div className="grid gap-3">
                {activeContracts.map((rental) => (
                  <label
                    key={rental.rentalFormId}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.rentalFormId === rental.rentalFormId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="roomSelection"
                      value={rental.rentalFormId}
                      checked={form.rentalFormId === rental.rentalFormId}
                      onChange={(e) => setForm({ ...form, rentalFormId: e.target.value })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {rental.dormName} - Tầng {rental.floor} - Phòng {rental.roomName}
                      </p>
                      <p className="text-sm text-slate-600">
                        Giường: {rental.bedNumbers}
                      </p>
                      <p className="text-sm text-slate-600">
                        Loại: {rental.type === 'DEPOSIT' ? 'Tiền cọc' : 'Toàn bộ'}
                      </p>
                      {rental.contractId && (
                        <>
                          <p className="text-sm text-slate-600">
                            Ngày bắt đầu: {new Date(rental.startDate!).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-sm text-slate-600">
                            Thời hạn thuê: {rental.stayDuration} tháng
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

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
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">Ngày trả phòng phải là ngày trong tương lai</p>
              </div>
            </div>

            {selectedContractDetails && (
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Thông tin chi tiết đơn đăng ký thuê</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Ký túc xá</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedContractDetails?.dormName}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Phòng</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedContractDetails?.roomName}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Tầng</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedContractDetails?.floor}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Giường</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedContractDetails?.bedNumbers}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Loại</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedContractDetails?.type === 'DEPOSIT' ? 'Tiền cọc' : 'Toàn bộ'}</p>
                  </div>
                  {selectedContractDetails?.contractId && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Thời hạn</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{selectedContractDetails?.stayDuration} tháng, từ {new Date(selectedContractDetails?.startDate!).toLocaleDateString('vi-VN')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/checkout-requests')}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </form>
        )}
      </section>
  );
};
