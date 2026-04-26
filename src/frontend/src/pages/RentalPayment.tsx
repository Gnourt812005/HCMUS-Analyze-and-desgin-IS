import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  PaymentMethod,
  PaymentAction,
  PaymentPreviewDTO
} from '@dormarch/shared';
import { RentalService } from '../api/RentalService';

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
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

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

    window.setTimeout(async () => {
      try {
        const response = await RentalService.confirm({
          registrationId: flowState.registrationId,
          action: flowState.action,
          method
        });

        if (response.status !== 200) {
          throw new Error('Xác nhận thanh toán thất bại.');
        }

        setInvoiceId(response.data.invoiceId);
        setIsCompleted(true);
        setStatusText('Thanh toán thành công');
      } catch (error: any) {
        setStatusText('Xác nhận thanh toán thất bại');
        alert(error.message || 'Không thể xác nhận thanh toán.');
      } finally {
        setIsVerifying(false);
      }
    }, 3000);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Hoàn tất thanh toán</h1>
            <p className="text-sm text-slate-500">Mã đăng ký: {flowState.registrationId.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Chi tiết thanh toán</h2>
          <div className="space-y-3">
            {flowState.preview.items.map((item, idx) => (
              <div key={`${item.label}-${idx}`} className="flex justify-between items-center">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="text-sm font-bold text-slate-800">{item.amount.toLocaleString('vi-VN')} VND</span>
              </div>
            ))}
            <div className="pt-4 mt-1 border-t border-slate-200 flex justify-between items-center">
              <span className="text-base font-bold text-slate-800">Tổng số tiền</span>
              <span className="text-xl font-black text-blue-700">{flowState.preview.totalAmount.toLocaleString('vi-VN')} VND</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Phương thức thanh toán</label>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50/50 text-blue-700">
              <span className="material-symbols-outlined">
                {method === 'BANK' ? 'account_balance' : 'account_balance_wallet'}
              </span>
              <span className="text-sm font-bold">
                {method === 'BANK' ? 'Chuyển khoản Ngân hàng' : 'Ví điện tử'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center bg-white">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Quét mã QR để thanh toán</p>
            <div className="relative group">
              <div className="absolute -inset-4 bg-blue-600/5 rounded-3xl blur-xl group-hover:bg-blue-600/10 transition-all"></div>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=RENTAL-${flowState.registrationId}-${flowState.action}`}
                alt="QR Payment"
                className="relative h-48 w-48 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              />
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded-full">
              <div className={`h-2 w-2 rounded-full animate-pulse ${isCompleted ? 'bg-green-500' : 'bg-amber-500'}`}></div>
              {statusText}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePaid}
              disabled={isVerifying || isCompleted}
              className="w-full rounded-xl bg-blue-700 py-4 font-bold text-white shadow-lg shadow-blue-700/25 hover:bg-blue-800 active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:shadow-none"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span>Đang xác nhận...</span>
                </div>
              ) : isCompleted ? (
                'Thanh toán hoàn tất'
              ) : (
                'Tôi đã thanh toán'
              )}
            </button>
            <button 
              onClick={() => navigate('/dorms')} 
              className="w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Quay về danh sách
            </button>
          </div>
        </div>

        {isCompleted && (
          <div className="mt-8 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 animate-in slide-in-from-bottom-4 duration-300">
            <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">Thanh toán thành công!</p>
              <p className="text-xs text-emerald-700 mt-1">
                Hợp đồng đã được kích hoạt{invoiceId ? `. Mã hóa đơn: ${invoiceId}` : ''}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
