import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiClient } from '../../api/ApiClient';
import { CheckoutRequestDTO, ContractDTO, RefundCalculationDTO, CheckoutStatus } from '@dormarch/shared';

export const AdminLiquidation = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [checkoutRequest, setCheckoutRequest] = useState<CheckoutRequestDTO | null>(null);
  const [contract, setContract] = useState<ContractDTO | null>(null);
  const [calculation, setCalculation] = useState<RefundCalculationDTO | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);

  // Load data on mount
  useEffect(() => {
    const abortController = new AbortController();
    loadData(abortController);
    
    return () => {
      abortController.abort();
    };
  }, [requestId]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const loadData = async (abortController: AbortController) => {
    if (!requestId) {
      setError('Không tìm thấy mã yêu cầu');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load checkout request with contract details
      interface DetailResponse {
        request: CheckoutRequestDTO;
        contract?: ContractDTO | null;
        depositAmount?: number;
      }
      const detailData = await ApiClient.get<DetailResponse>(`/checkout-requests/${requestId}/details`);
      
      if (abortController.signal.aborted) return;
      
      setCheckoutRequest(detailData.request);
      if (detailData.contract) {
        setContract(detailData.contract);
        setDepositAmount(detailData.depositAmount || 0);
      }

      // Load refund calculation
      try {
        const calcData = await ApiClient.get<RefundCalculationDTO>(`/refund-calculations/by-request/${requestId}`);
        if (!abortController.signal.aborted) {
          setCalculation(calcData);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError('Không tìm thấy bảng đối soát. Vui lòng hoàn thành tính toán hoàn cọc trước.');
        }
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleFinalizeLiquidation = async () => {
    if (!checkoutRequest) return;

    try {
      setFinalizing(true);
      setError(null);

      await ApiClient.patch(`/checkout-requests/${checkoutRequest.requestId}/complete-liquidation`, {
        body: JSON.stringify({
          status: CheckoutStatus.LIQUIDATED,
          expectedStatus: checkoutRequest.status
        })
      });
      
      showSuccess('Hoàn tất thanh lý thành công!');
      setTimeout(() => {
        navigate('/admin/checkout');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi hoàn tất thanh lý');
    } finally {
      setFinalizing(false);
    }
  };

  const formatCurrency = (value?: number | null) => {
    const safeValue = Number(value ?? 0);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number.isNaN(safeValue) ? 0 : Math.abs(safeValue));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-500">Đang tải thông tin...</div>
      </div>
    );
  }

  if (!checkoutRequest || !contract || !calculation) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hoàn tất thanh lý</h1>
            <p className="text-sm text-slate-500 mt-1">Xác nhận và hoàn tất quá trình thanh lý hợp đồng</p>
          </div>
          <button
            onClick={() => navigate('/admin/checkout')}
            className="inline-flex items-center justify-center rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600 mt-0.5">error</span>
            <div>
              <p className="font-semibold text-red-900">Không tìm thấy dữ liệu</p>
              <p className="text-sm text-red-700 mt-1">
                {error || 'Không tìm thấy yêu cầu, hợp đồng hoặc bảng đối soát'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hoàn tất thanh lý</h1>
        </div>
        <button
          onClick={() => navigate('/admin/checkout')}
          className="inline-flex items-center justify-center rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
        >
          ✕
        </button>
      </div>

      {successMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-red-600 text-white px-5 py-3.5 rounded-xl shadow-xl transition-all">
          <span className="material-symbols-outlined text-lg">error</span>
          <span className="text-sm font-semibold">{error}</span>
          <button onClick={() => setError(null)} className="ml-2 hover:text-red-200 transition-colors p-1 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {/* Contract Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Thông tin hợp đồng</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 uppercase">Mã hợp đồng</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{contract.contractId}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 uppercase">Ký túc xá</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{contract.dormName}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 uppercase">Phòng</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{contract.roomId}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 uppercase">Tầng</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{contract.floor}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 uppercase">Giường</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{contract.bedNumbers}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 uppercase">Số tiền cọc</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatCurrency(depositAmount)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500 uppercase">Thời hạn</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{contract.stayDuration} tháng</p>
          </div>
        </div>
      </div>

      {/* Refund Calculation Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Bảng tính hoàn trả</h2>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-700">Tiền cọc</span>
            <span className="font-semibold text-slate-900">{formatCurrency(calculation.depositAmount || 0)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-700">Phí hư hỏng</span>
            <span className="font-semibold text-slate-900">{formatCurrency(calculation.damageFee || 0)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-700">Phí phát sinh</span>
            <span className="font-semibold text-slate-900">{formatCurrency(calculation.extraFee || 0)}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between gap-4 font-semibold text-slate-900">
            <span>Tổng hoàn trả / cần đóng</span>
            <span>{formatCurrency(calculation.finalRefundAmount || 0)}</span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Ghi chú từ bảng đối soát</h3>
          <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">
            {calculation.notes || 'Không có ghi chú.'}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/admin/checkout')}
          className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-3 px-4 rounded-xl transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleFinalizeLiquidation}
          disabled={finalizing}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {finalizing ? 'Đang hoàn tất...' : 'Hoàn tất thanh lý'}
        </button>
      </div>
    </div>
  );
};
