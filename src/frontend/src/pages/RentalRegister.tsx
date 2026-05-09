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
  profile?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
  roomName?: string;
  bedNumbers?: string[];
};

export const RentalRegister = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const flowState = state as RegisterFlowState | null;

  const [customerName, setCustomerName] = useState(flowState?.profile?.fullName || '');
  const [phone, setPhone] = useState(flowState?.profile?.phone || '');
  const [email, setEmail] = useState(flowState?.profile?.email || '');

  const [registration, setRegistration] = useState<RentalRegistrationDTO | null>(null);
  const [preview, setPreview] = useState<PaymentPreviewDTO | null>(null);
  const [currentAction, setCurrentAction] = useState<PaymentAction | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK');

  const [loading, setLoading] = useState(false);

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

  const handleAction = async (action: PaymentAction) => {
    const normalizedPhone = phone.trim();
    if (!/^\d{10}$/.test(normalizedPhone)) {
      alert('Số điện thoại phải gồm đúng 10 chữ số.');
      return;
    }

    if (!customerName.trim() || !email.trim()) {
      alert('Vui lòng điền đầy đủ thông tin Họ tên và Email.');
      return;
    }

    setLoading(true);

    try {
      // Direct registration with the chosen action
      const response = await RentalService.register({
        roomId: flowState.roomId,
        bedIds: flowState.bedIds,
        customerName,
        idCard: flowState.idCard,
        phone: normalizedPhone,
        email,
        rentalMonths: 1, // Default to 1 month
        acceptedConditions: flowState.acceptedConditions,
        services: [],
        action
      });

      if (response.status === 201) {
        setRegistration(response.data);
        setCurrentAction(action);
        setPreview({
          registrationId: response.data.registrationId,
          action,
          items: response.data.summary,
          totalAmount: response.data.summary.reduce((sum, item) => sum + item.amount, 0)
        });
      }
    } catch (error: any) {
      alert(error.message || 'Không thể thực hiện yêu cầu.');
    } finally {
      setLoading(false);
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
      <p className="mt-2 text-slate-600">
        Phòng {flowState.roomName || flowState.roomId} - Giường {flowState.bedNumbers?.join(', ') || flowState.bedIds.join(', ')}
      </p>

      {flowState.lockBedSelection && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
          Hệ thống ghi nhận bạn đã đặt cọc trước đó. Một số tùy chọn giường sẽ bị khóa theo quy trình.
        </div>
      )}

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 space-y-6">
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
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Chọn phương án thanh toán</h2>
          <p className="text-sm text-slate-500 mb-4">Vui lòng kiểm tra kỹ thông tin trước khi chọn.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => handleAction('DEPOSIT')} 
              disabled={loading} 
              className="flex-1 rounded-xl bg-slate-900 px-6 py-4 font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:bg-slate-200"
            >
              {loading && currentAction === 'DEPOSIT' ? 'Đang xử lý...' : 'Đặt cọc ngay'}
            </button>
            <button 
              onClick={() => handleAction('FULL_PAYMENT')} 
              disabled={loading} 
              className="flex-1 rounded-xl bg-blue-700 px-6 py-4 font-bold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800 active:scale-[0.98] transition-all disabled:bg-slate-200"
            >
              {loading && currentAction === 'FULL_PAYMENT' ? 'Đang xử lý...' : 'Thanh toán trọn gói'}
            </button>
          </div>
        </div>
      </div>

      {preview && currentAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl animate-in zoom-in duration-200">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                {currentAction === 'DEPOSIT' ? 'Xác nhận đặt cọc' : 'Xác nhận thanh toán trọn gói'}
              </h3>
            </div>
            <div className="space-y-3 px-6 py-4">
              {preview.items.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-bold text-slate-800">{item.amount.toLocaleString('vi-VN')} VND</span>
                </div>
              ))}
              <div className="mt-2 border-t border-slate-200 pt-3 flex justify-between font-black text-lg">
                <span>Tổng cộng</span>
                <span className="text-blue-700">{preview.totalAmount.toLocaleString('vi-VN')} VND</span>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Phương thức thanh toán</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="BANK">Chuyển khoản Ngân hàng</option>
                  <option value="EWALLET">Ví điện tử</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50/50 rounded-b-xl">
              <button
                onClick={() => {
                  setPreview(null);
                  setCurrentAction(null);
                }}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
              >
                Quay lại sửa
              </button>
              <button 
                onClick={goToPayment} 
                className="flex-1 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/10 hover:bg-blue-800 transition-all"
              >
                Tiếp tục thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
