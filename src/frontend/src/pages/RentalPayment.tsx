import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  PaymentMethod,
  PaymentAction,
  PaymentPreviewDTO
} from '@dormarch/shared';

type PaymentFlowState = {
  registrationId: string;
  action: PaymentAction;
  defaultMethod: PaymentMethod;
  preview: PaymentPreviewDTO;
};

export const RentalPayment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const flowState = state as PaymentFlowState | null;

  const [method, setMethod] = useState<PaymentMethod>(flowState?.defaultMethod || 'BANK');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [statusText, setStatusText] = useState('Sẵn sàng thanh toán');

  if (!flowState) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
          Bạn chưa đi qua bước đăng ký thuê.
          <button onClick={() => navigate('/dorms')} className="ml-2 underline font-semibold">Quay lại</button>
        </div>
      </div>
    );
  }

  const handlePaid = () => {
    if (isVerifying || isCompleted) return;

    setIsVerifying(true);
    setStatusText('Đang xác nhận giao dịch...');

    window.setTimeout(() => {
      setIsVerifying(false);
      setIsCompleted(true);
      setStatusText('Thanh toán thành công');
    }, 3000);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-800">Thanh toán</h1>

        <div className="mt-4 space-y-2">
          {flowState.preview.items.map((item, idx) => (
            <div key={`${item.label}-${idx}`} className="flex justify-between text-sm">
              <span className="text-slate-600">{item.label}</span>
              <span className="font-semibold text-slate-800">{item.amount.toLocaleString('vi-VN')} VND</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
            <span>Tổng cộng</span>
            <span className="text-blue-700">{flowState.preview.totalAmount.toLocaleString('vi-VN')} VND</span>
          </div>
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold text-slate-700">Phương thức thanh toán</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            disabled={isVerifying || isCompleted}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="BANK">Ngân hàng</option>
            <option value="EWALLET">Ví điện tử</option>
          </select>
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">Mã QR thanh toán mẫu</p>
          <div className="mt-3 flex justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=RENTAL-${flowState.registrationId}-${flowState.action}`}
              alt="QR thanh toán mẫu"
              className="h-[220px] w-[220px] rounded-md border border-slate-300 bg-white p-2"
            />
          </div>
          <p className="mt-3 text-center text-sm text-slate-600">Trạng thái: {statusText}</p>
        </div>

        <div className="mt-5">
          <button
            onClick={handlePaid}
            disabled={isVerifying || isCompleted}
            className="w-full rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
          >
            {isVerifying ? 'Đang xác nhận...' : isCompleted ? 'Đã thanh toán' : 'Thanh toán'}
          </button>
        </div>

        {isCompleted && (
          <p className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Thanh toán đã hoàn tất. Bạn có thể quay về danh sách để thực hiện nghiệp vụ tiếp theo.
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={() => navigate('/dorms')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Quay về danh sách
          </button>
        </div>
      </div>
    </div>
  );
};
