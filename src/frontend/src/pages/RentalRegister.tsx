import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  PaymentAction,
  PaymentMethod,
  PaymentPreviewDTO,
  RentalRegistrationDTO
} from '@dormarch/shared';
import { RentalService } from '../api/RentalService';

type RegisterFlowState = {
  roomId: string;
  bedIds: string[];
  idCard: string;
  acceptedConditions: boolean;
  alreadyDeposited: boolean;
  lockBedSelection: boolean;
};

export const RentalRegister = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const flowState = state as RegisterFlowState | null;

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rentalMonths, setRentalMonths] = useState(6);

  const [registration, setRegistration] = useState<RentalRegistrationDTO | null>(null);
  const [preview, setPreview] = useState<PaymentPreviewDTO | null>(null);
  const [currentAction, setCurrentAction] = useState<PaymentAction | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK');

  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  if (!flowState) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
          Bạn chưa đi qua bước điều kiện thuê.
          <button onClick={() => navigate('/dorms')} className="ml-2 underline font-semibold">
            Quay lại danh sách ký túc xá
          </button>
        </div>
      </div>
    );
  }

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();

    const normalizedPhone = phone.trim();
    if (!/^\d{10}$/.test(normalizedPhone)) {
      alert('Số điện thoại phải gồm đúng 10 chữ số.');
      return;
    }

    setLoadingRegister(true);

    try {
      const response = await RentalService.register({
        roomId: flowState.roomId,
        bedIds: flowState.bedIds,
        customerName,
        idCard: flowState.idCard,
        phone: normalizedPhone,
        email,
        rentalMonths,
        acceptedConditions: flowState.acceptedConditions,
        services: []
      });

      if (response.status === 201) {
        setRegistration(response.data);
        alert('Đăng ký thuê thành công. Vui lòng chọn Đặt cọc hoặc Thanh toán.');
      }
    } catch (error: any) {
      alert(error.message || 'Không thể đăng ký thuê.');
    } finally {
      setLoadingRegister(false);
    }
  };

  const handleOpenPreview = async (action: PaymentAction) => {
    if (!registration) return;

    setLoadingPreview(true);
    try {
      const response = await RentalService.preview({
        registrationId: registration.registrationId,
        action
      });

      if (response.status === 200) {
        setCurrentAction(action);
        setPreview(response.data);
      }
    } catch (error: any) {
      alert(error.message || 'Không thể tải tóm tắt thanh toán.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const goToPayment = async () => {
    if (!registration || !currentAction) return;

    navigate('/rental/payment', {
      state: {
        registrationId: registration.registrationId,
        action: currentAction,
        defaultMethod: paymentMethod,
        preview
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-800">Đăng ký thuê</h1>
      <p className="mt-2 text-slate-600">Phòng {flowState.roomId} - Giường {flowState.bedIds.join(', ')}</p>

      {flowState.lockBedSelection && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
          Hệ thống ghi nhận bạn đã đặt cọc trước đó. Một số tùy chọn giường sẽ bị khóa theo quy trình.
        </div>
      )}

      <form onSubmit={handleRegister} className="mt-6 rounded-lg border border-slate-200 bg-white p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Họ tên</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Số tháng thuê</label>
            <input
              type="number"
              min={1}
              value={rentalMonths}
              onChange={(e) => setRentalMonths(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <button type="submit" disabled={loadingRegister} className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:bg-slate-300">
          {loadingRegister ? 'Đang xử lý...' : 'Xác nhận đăng ký thuê'}
        </button>
      </form>

      {registration && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-800">Chọn phương án thanh toán</h2>
          <p className="mt-1 text-sm text-slate-600">Sau khi chọn, hệ thống sẽ mở popup tóm tắt dịch vụ và chi phí.</p>
          <div className="mt-4 flex gap-3">
            <button onClick={() => handleOpenPreview('DEPOSIT')} disabled={loadingPreview} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">
              Đặt cọc
            </button>
            <button onClick={() => handleOpenPreview('FULL_PAYMENT')} disabled={loadingPreview} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">
              Thanh toán
            </button>
          </div>
        </div>
      )}

      {preview && currentAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                {currentAction === 'DEPOSIT' ? 'Xác nhận đặt cọc' : 'Xác nhận thanh toán'}
              </h3>
            </div>
            <div className="space-y-2 px-6 py-4">
              {preview.items.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.amount.toLocaleString('vi-VN')} VND</span>
                </div>
              ))}
              <div className="mt-2 border-t border-slate-200 pt-2 flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span className="text-blue-700">{preview.totalAmount.toLocaleString('vi-VN')} VND</span>
              </div>

              <div className="pt-2">
                <label className="text-sm font-semibold text-slate-700">Phương thức</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="BANK">Ngân hàng</option>
                  <option value="EWALLET">Ví điện tử</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => {
                  setPreview(null);
                  setCurrentAction(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Thay đổi thông tin
              </button>
              <button onClick={goToPayment} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
                Tiếp tục thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
