import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '../api/ApiClient';
import { CheckoutRequestDTO, CheckoutStatus, RefundCalculationDTO } from '@dormarch/shared';

type CheckoutRequestDetailResponse = {
  request: CheckoutRequestDTO;
  rentalForm?: any | null;
  refund?: RefundCalculationDTO | null;
  depositAmount?: number;
};

const formatCurrency = (value?: number | null) => {
  const safeValue = Number(value ?? 0);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number.isNaN(safeValue) ? 0 : safeValue);
};

const STATUS_STYLE: Record<CheckoutStatus, string> = {
  [CheckoutStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  [CheckoutStatus.PROCESSING]: 'bg-blue-50 text-blue-700 border-blue-200',
  [CheckoutStatus.LIQUIDATED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [CheckoutStatus.CANCELLED]: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_DOT: Record<CheckoutStatus, string> = {
  [CheckoutStatus.PENDING]: 'bg-yellow-500',
  [CheckoutStatus.PROCESSING]: 'bg-blue-500',
  [CheckoutStatus.LIQUIDATED]: 'bg-emerald-500',
  [CheckoutStatus.CANCELLED]: 'bg-slate-400',
};

const STATUS_LABEL: Record<CheckoutStatus, string> = {
  [CheckoutStatus.PENDING]: 'Chờ xử lý',
  [CheckoutStatus.PROCESSING]: 'Đang xử lý',
  [CheckoutStatus.LIQUIDATED]: 'Đã thanh lý',
  [CheckoutStatus.CANCELLED]: 'Đã hủy',
};

export const ViewCheckoutRequest = () => {
  const navigate = useNavigate();
  // const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [checkoutRequests, setCheckoutRequests] = useState<CheckoutRequestDTO[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CheckoutRequestDTO | null>(null);
  const [requestDetail, setRequestDetail] = useState<CheckoutRequestDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const detailAbortControllerRef = useRef<AbortController | null>(null);

  const stats = useMemo(() => ({
    total: checkoutRequests.length,
    pending: checkoutRequests.filter(r => r.status === CheckoutStatus.PENDING).length,
    processing: checkoutRequests.filter(r => r.status === CheckoutStatus.PROCESSING).length,
    completed: checkoutRequests.filter(r => r.status === CheckoutStatus.LIQUIDATED).length,
  }), [checkoutRequests]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  useEffect(() => {
    const abortController = new AbortController();
    loadRequests(abortController);
    
    return () => {
      abortController.abort();
      if (detailAbortControllerRef.current) {
        detailAbortControllerRef.current.abort();
      }
    };
  }, []);

  const loadRequests = async (abortController: AbortController) => {
    try {
      setLoading(true);
      setError(null);

      const requests = await ApiClient.get<CheckoutRequestDTO[]>('/checkout-requests');
      
      if (abortController.signal.aborted) return;
      
      setCheckoutRequests(requests || []);
    } catch (err) {
      if (!abortController.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Lỗi tải yêu cầu trả phòng');
        setCheckoutRequests([]);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const loadDetail = async (request: CheckoutRequestDTO) => {
    // Cancel previous request if any
    if (detailAbortControllerRef.current) {
      detailAbortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    detailAbortControllerRef.current = abortController;
    
    setSelectedRequest(request);
    setRequestDetail(null);
    setDetailLoading(true);
    setError(null);

    try {
      const detail = await ApiClient.get<CheckoutRequestDetailResponse>(`/checkout-requests/${request.requestId}/details`);
      
      if (!abortController.signal.aborted) {
        setRequestDetail(detail);
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết yêu cầu');
      }
    } finally {
      if (!abortController.signal.aborted) {
        setDetailLoading(false);
      }
    }
  };

  const closeDetail = () => {
    setSelectedRequest(null);
    setRequestDetail(null);
    setDetailLoading(false);
  };

  const handleCancelRequest = async (requestId: string) => {
    const originalRequests = [...checkoutRequests];
    const originalSelectedRequest = selectedRequest ? { ...selectedRequest } : null;
    const originalRequestDetail = requestDetail ? { ...requestDetail } : null;

    const cancelledRequest = { ...checkoutRequests.find(r => r.requestId === requestId)!, status: CheckoutStatus.CANCELLED };
    setCheckoutRequests(checkoutRequests.map(r => r.requestId === requestId ? cancelledRequest : r));
    if (selectedRequest?.requestId === requestId) {
      setSelectedRequest(cancelledRequest);
      setRequestDetail(prev => prev ? { ...prev, request: cancelledRequest } : prev);
    }

    try {
      setError(null);
      const request = checkoutRequests.find(r => r.requestId === requestId);
      await ApiClient.patch(`/checkout-requests/${requestId}/status`, {
        body: JSON.stringify({
          status: CheckoutStatus.CANCELLED,
          expectedStatus: request?.status
        })
      });
      showSuccess('Đã hủy yêu cầu thành công!');
    } catch (err) {
      setCheckoutRequests(originalRequests);
      setSelectedRequest(originalSelectedRequest);
      setRequestDetail(originalRequestDetail);
      setError(err instanceof Error ? err.message : 'Lỗi hủy yêu cầu');
    }
  };

 return (
    <div className="w-full space-y-6">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                Yêu cầu Trả phòng
                <span className="flex items-center justify-center bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                  {stats.total}
                </span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">Danh sách các yêu cầu bạn đã tạo.</p>
            </div>
            <button
              onClick={() => navigate('/create-checkout-request')}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-blue-200"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Tạo yêu cầu mới
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng yêu cầu', value: stats.total, icon: 'receipt_long', color: 'text-blue-600 bg-blue-50' },
            { label: 'Chờ tiếp nhận', value: stats.pending, icon: 'pending_actions', color: 'text-amber-600 bg-amber-50' },
            { label: 'Đang xử lý', value: stats.processing, icon: 'sync', color: 'text-purple-600 bg-purple-50' },
            { label: 'Đã hoàn tất', value: stats.completed, icon: 'check_circle', color: 'text-emerald-600 bg-emerald-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-xl">{s.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[768px] text-sm table-fixed">
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[35%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Mã YC</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Phòng/Giường</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Lịch trình</th>
                  <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-slate-400"><div className="flex flex-col items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl mb-3">autorenew</span><p className="font-medium">Đang tải dữ liệu...</p></div></td>
                  </tr>
                ) : checkoutRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-slate-400"><div className="flex flex-col items-center justify-center"><span className="material-symbols-outlined text-5xl mb-3">assignment_return</span><p className="font-medium">Bạn chưa có yêu cầu trả phòng nào</p></div></td>
                  </tr>
                ) : (
                  checkoutRequests.map((request) => (
                    <tr key={request.code} className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => loadDetail(request)}>
                      <td className="px-5 py-4 font-bold text-blue-700 break-words">{request.code}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 truncate">{request.dormName} - Tầng {request.floor}</p>
                        <p className="text-xs text-slate-500 truncate">Phòng: {request.roomName}</p>
                        <p className="text-xs text-slate-500 truncate">Giường: {request.bedNumbers}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-700">{new Date(request.createdAt).toLocaleDateString('vi-VN')}</p>
                        <p className="text-xs text-slate-400">→ {new Date(request.expectedDate).toLocaleDateString('vi-VN')}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[request.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[request.status]}`} />
                          {STATUS_LABEL[request.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700">
                          <span className="material-symbols-outlined text-base">chevron_right</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {!loading && checkoutRequests.length > 0 && (
                <tfoot>
                  <tr className="bg-white">
                    <td colSpan={5} className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
                      Hiển thị {checkoutRequests.length} yêu cầu
                    </td>
                  </tr>
                </tfoot>
              )}
          </table>
        </div>

        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDetail} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
              <div className="px-7 py-5 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-slate-900">Yêu cầu {selectedRequest.code}</h2>
                      <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[selectedRequest.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[selectedRequest.status]}`} />
                        {STATUS_LABEL[selectedRequest.status]}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm">Ngày tạo: {new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <button onClick={closeDetail} className="p-2 hover:bg-slate-100 rounded-lg transition-colors mt-1">
                    <span className="material-symbols-outlined text-slate-500">close</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mã yêu cầu</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedRequest.code || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Phòng</span>
                    <span className="text-sm font-semibold text-slate-800">{requestDetail?.request?.roomName || selectedRequest.roomName || 'Đang tải...'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tầng</span>
                    <span className="text-sm font-semibold text-slate-800">{requestDetail?.request?.floor || selectedRequest.floor || 'Đang tải...'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Giường</span>
                    <span className="text-sm font-semibold text-slate-800">{requestDetail?.request?.bedNumbers || selectedRequest.bedNumbers || 'Đang tải...'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ngày dự kiến trả</span>
                    <span className="text-sm font-semibold text-slate-800">{new Date(selectedRequest.expectedDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tiền cọc</span>
                    <span className="text-sm font-semibold text-slate-800">{requestDetail?.depositAmount ? formatCurrency(requestDetail.depositAmount) : 'Đang tải...'}</span>
                  </div>
                </div>

                {detailLoading ? (
                  <div className="flex items-center justify-center py-10 text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-3xl mb-2">autorenew</span>
                  </div>
                ) : requestDetail?.refund ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Bảng tính đối soát</h3>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    <div className="pl-10 space-y-2">
                      <div className="flex items-center justify-between py-2.5 border-b border-dashed border-slate-200">
                        <span className="text-sm text-slate-600">Cọc theo đơn đăng ký</span>
                        <span className="text-sm font-bold text-slate-800">{formatCurrency(requestDetail.refund.depositAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-dashed border-slate-200">
                        <span className="text-sm text-slate-600">Phí hư hỏng (-khấu trừ)</span>
                        <span className="text-sm font-bold text-red-600">-{formatCurrency(requestDetail.refund.damageFee)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-slate-200">
                        <span className="text-sm text-slate-600">Phí phát sinh nợ (-khấu trừ)</span>
                        <span className="text-sm font-bold text-red-600">-{formatCurrency(requestDetail.refund.extraFee)}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm font-bold text-slate-800">Khoản hoàn / Cần đóng</span>
                        <span className="text-lg font-black text-blue-700">{formatCurrency(requestDetail.refund.finalRefundAmount)}</span>
                      </div>
                    </div>

                    {requestDetail.refund.notes && (
                      <div className="pl-10 mt-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ghi chú đối soát</p>
                        <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 whitespace-pre-wrap">
                          {requestDetail.refund.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (selectedRequest.status === CheckoutStatus.PROCESSING || selectedRequest.status === CheckoutStatus.LIQUIDATED) ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                    <span className="text-sm font-medium">Chưa có bảng đối soát</span>
                  </div>
                ) : null}

              </div>

              <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                <div>
                  {(selectedRequest.status === CheckoutStatus.PENDING ||
                    selectedRequest.status === CheckoutStatus.PROCESSING) && (
                    <button
                      onClick={() => {
                        handleCancelRequest(selectedRequest.requestId);
                        closeDetail();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-all"
                    >
                      <span className="material-symbols-outlined text-base">cancel</span>
                      Hủy yêu cầu
                    </button>
                  )}
                </div>
                <button onClick={closeDetail} className="px-5 py-2.5 text-sm font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-all">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};
