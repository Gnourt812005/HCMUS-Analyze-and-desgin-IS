import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  PaymentMethod,
  PaymentSessionDTO,
  PaymentVerificationOutcome,
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
  const [session, setSession] = useState<PaymentSessionDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const canVerify = !!session && session.status === 'QR_READY';
  const canRetry = !!session && (session.status === 'TIMEOUT' || session.status === 'FAILED');
  const isCompleted = session?.status === 'COMPLETED';

  useEffect(() => {
    if (!flowState) return;

    const createCode = async () => {
      setLoading(true);
      try {
        const response = await RentalService.createPaymentCode({
          registrationId: flowState.registrationId,
          action: flowState.action,
          method
        });

        if (response.status === 200) {
          setSession(response.data);
        }
      } catch (error: any) {
        alert(error.message || 'Không thể tạo mã thanh toán.');
      } finally {
        setLoading(false);
      }
    };

    createCode();
  }, [flowState, method]);

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

  const verify = async (outcome: PaymentVerificationOutcome) => {
    if (!session || !canVerify) return;

    setLoading(true);
    try {
      const verifyResponse = await RentalService.verifyPayment({
        sessionId: session.sessionId,
        outcome
      });

      if (verifyResponse.status === 200) {
        setSession(verifyResponse.data);
      }

      if (outcome === 'success') {
        const finalizeResponse = await RentalService.finalizePayment({ sessionId: session.sessionId });
        if (finalizeResponse.status === 200) {
          setSession(finalizeResponse.data);
          alert(`Thanh toán hoàn tất. Mã hóa đơn: ${finalizeResponse.data.invoiceId}`);
        }
      }
    } catch (error: any) {
      alert(error.message || 'Không thể xác minh giao dịch.');
    } finally {
      setLoading(false);
    }
  };

  const retry = async () => {
    if (!session || !canRetry) return;

    setLoading(true);
    try {
      const response = await RentalService.retryPayment({ sessionId: session.sessionId });
      if (response.status === 200) {
        setSession(response.data);
      }
    } catch (error: any) {
      alert(error.message || 'Không thể thử lại thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const response = await RentalService.getPaymentStatus(session.sessionId);
      if (response.status === 200) {
        setSession(response.data);
      }
    } catch (error: any) {
      alert(error.message || 'Không thể cập nhật trạng thái thanh toán.');
    } finally {
      setLoading(false);
    }
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
            disabled={loading || !!session}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="BANK">Ngân hàng</option>
            <option value="EWALLET">Ví điện tử</option>
          </select>
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">Mã QR thanh toán</p>
          <p className="mt-2 font-mono text-sm text-slate-800 break-all">{session?.qrCode || 'Đang tạo mã...'}</p>
          <p className="mt-2 text-xs text-slate-500">Trạng thái: {session?.status || 'INIT'}</p>
          {session?.message && <p className="mt-1 text-xs text-slate-600">{session.message}</p>}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">
          <button onClick={() => verify('success')} disabled={loading || !canVerify} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">
            Đã quét QR và thanh toán
          </button>
          <button onClick={() => verify('timeout')} disabled={loading || !canVerify} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">
            Giả lập timeout ngân hàng
          </button>
          <button onClick={() => verify('cancel')} disabled={loading || !canVerify} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">
            Hủy / Không quét mã
          </button>
          <button onClick={retry} disabled={loading || !canRetry} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:bg-slate-100">
            Thử lại
          </button>
          <button onClick={refreshStatus} disabled={loading || !session} className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 disabled:bg-slate-100 disabled:text-slate-400">
            Cập nhật trạng thái
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
