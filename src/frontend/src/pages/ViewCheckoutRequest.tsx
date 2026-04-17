import { useEffect, useState, ChangeEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerSidebar } from '../components/CustomerSidebar';
import { ApiClient } from '../api/ApiClient';
import { CheckoutRequestDTO, CheckoutStatus, UserProfileDTO, ContractDTO, RefundCalculationDTO } from '@dormarch/shared';

type CheckoutRequestDetailResponse = {
  request: CheckoutRequestDTO;
  contract?: ContractDTO | null;
  refund?: RefundCalculationDTO | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const getStatusLabel = (status: CheckoutStatus) => {
  switch (status) {
    case CheckoutStatus.PENDING:
      return 'Chờ xử lý';
    case CheckoutStatus.PROCESSING:
      return 'Đang xử lý';
    case CheckoutStatus.PENDING_LIQUIDATION:
      return 'Chờ thanh lý';
    case CheckoutStatus.LIQUIDATED:
      return 'Đã thanh lý';
    case CheckoutStatus.CANCELLED:
      return 'Đã hủy';
    case CheckoutStatus.REJECTED:
      return 'Từ chối';
    default:
      return status;
  }
};

const getStatusBadgeClass = (status: CheckoutStatus) => {
  switch (status) {
    case CheckoutStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case CheckoutStatus.PROCESSING:
      return 'bg-blue-100 text-blue-800';
    case CheckoutStatus.PENDING_LIQUIDATION:
      return 'bg-purple-100 text-purple-800';
    case CheckoutStatus.LIQUIDATED:
      return 'bg-green-100 text-green-800';
    case CheckoutStatus.CANCELLED:
      return 'bg-gray-100 text-gray-800';
    case CheckoutStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

export const ViewCheckoutRequest = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [checkoutRequests, setCheckoutRequests] = useState<CheckoutRequestDTO[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CheckoutRequestDTO | null>(null);
  const [requestDetail, setRequestDetail] = useState<CheckoutRequestDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detailAbortControllerRef = useRef<AbortController | null>(null);

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

      const profileData = await ApiClient.get<UserProfileDTO>('/users/profile');
      
      if (abortController.signal.aborted) return;
      
      setProfile(profileData);

      const allRequests = await ApiClient.get<CheckoutRequestDTO[]>('/checkout-requests');
      
      if (abortController.signal.aborted) return;
      
      const filteredRequests = profileData.cccd
        ? allRequests.filter((request) => request.userCCCD === profileData.cccd)
        : [];

      setCheckoutRequests(filteredRequests);
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
    try {
      await ApiClient.patch(`/checkout-requests/${requestId}/status`, {
        body: JSON.stringify({ status: CheckoutStatus.CANCELLED })
      });

      const updatedRequest = checkoutRequests.find(r => r.requestId === requestId);
      if (updatedRequest) {
        const cancelledRequest = { ...updatedRequest, status: CheckoutStatus.CANCELLED };
        setCheckoutRequests(checkoutRequests.map((request: CheckoutRequestDTO) => request.requestId === requestId ? cancelledRequest : request));
        if (selectedRequest?.requestId === requestId) {
          setSelectedRequest(cancelledRequest);
          setRequestDetail((prev: CheckoutRequestDetailResponse | null) => prev ? { ...prev, request: cancelledRequest } : prev);
        }
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi hủy yêu cầu');
    }
  };

  const renderStatusSpecific = () => {
    if (!selectedRequest) return null;
    const status = selectedRequest.status;
    const contract = requestDetail?.contract;
    const refund = requestDetail?.refund;

    if (status === CheckoutStatus.PENDING) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-800 mb-2">Số tiền cọc theo hợp đồng</p>
          {contract ? (
            <p className="text-slate-900 text-lg font-bold">{formatCurrency(contract.depositAmount)}</p>
          ) : (
            <p className="text-slate-600">Không tìm thấy thông tin hợp đồng. Vui lòng liên hệ quản lý.</p>
          )}
        </div>
      );
    }

    if (status === CheckoutStatus.PROCESSING || status === CheckoutStatus.PENDING_LIQUIDATION || status === CheckoutStatus.LIQUIDATED) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <div>
            <p className="font-semibold text-slate-800 mb-3">Bảng tính chi phí</p>
            {detailLoading ? (
              <p className="text-slate-500">Đang tải chi tiết...</p>
            ) : refund ? (
              <div className="grid gap-3 text-sm text-slate-700">
                <div className="flex justify-between gap-4">
                  <span>Tiền cọc</span>
                  <span>{formatCurrency(refund.depositAmount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Phí hư hỏng</span>
                  <span>{formatCurrency(refund.damageFee)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Phí phát sinh</span>
                  <span>{formatCurrency(refund.extraFee)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between gap-4 font-semibold text-slate-900">
                  <span>Tổng hoàn trả / cần đóng</span>
                  <span>{formatCurrency(refund.finalRefundAmount)}</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-600">Không có bảng tính chi phí.</p>
            )}
          </div>

          {status === CheckoutStatus.LIQUIDATED && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-800 mb-3">Tài liệu đính kèm</p>
              {selectedRequest.documentUrl && (
                <a
                  href={selectedRequest.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 underline mb-2"
                >
                  Xem biên bản trả phòng
                </a>
              )}
              {contract?.liquidationUrl ? (
                <a
                  href={contract.liquidationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  Xem biên bản thanh lý hợp đồng
                </a>
              ) : (
                <p className="text-slate-600">Không tìm thấy biên bản thanh lý hợp đồng.</p>
              )}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

 return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 px-6">
      <CustomerSidebar />

      <section className="md:col-span-9 space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Xem yêu cầu trả phòng</h1>
              <p className="text-sm text-slate-500">Danh sách các yêu cầu bạn đã tạo.</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                {checkoutRequests.length} yêu cầu
              </span>
              <button
                type="button"
                onClick={() => navigate('/create-checkout-request')}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                + Tạo yêu cầu trả phòng
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500">Đang tải yêu cầu...</div>
          ) : checkoutRequests.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              Bạn chưa có yêu cầu trả phòng nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-900">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Mã yêu cầu</th>
                    <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                    <th className="px-4 py-3 font-semibold">Ngày dự kiến trả</th>
                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {checkoutRequests.map((request) => (
                    <tr key={request.requestId} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-900 font-medium">{request.requestId}</td>
                      <td className="px-4 py-3">{new Date(request.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3">{new Date(request.expectedDate).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => loadDetail(request)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-lg transition-colors text-xs"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8">
            <div className="mx-auto w-full max-w-3xl">
              <div className="rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
                <div className="flex items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Chi tiết yêu cầu trả phòng</h2>
                    <p className="text-sm text-slate-500">Mã yêu cầu: {selectedRequest.requestId}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Ngày tạo</p>
                    <p className="mt-2 text-slate-900 font-medium">{new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Ngày dự kiến trả</p>
                    <p className="mt-2 text-slate-900 font-medium">{new Date(selectedRequest.expectedDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-sm text-slate-500">Trạng thái</p>
                    <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeClass(selectedRequest.status)}`}>
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-sm text-slate-500">Hợp đồng / Phòng đang thuê</p>
                    <p className="mt-2 text-slate-900 font-medium">
                      {requestDetail?.contract ? `Hợp đồng ${requestDetail.contract.contractId}` : 'Không có dữ liệu hợp đồng'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {requestDetail && renderStatusSpecific()}

                  {!requestDetail && detailLoading && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-500">Đang tải chi tiết...</div>
                  )}

                  {!requestDetail && !detailLoading && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-500">Không có dữ liệu chi tiết.</div>
                  )}
                </div>

                <div className="mt-6 border-t border-slate-200 pt-4">
                  <div className="flex flex-col sm:flex-row sm:justify-center gap-3">
                    {(selectedRequest.status === CheckoutStatus.PENDING ||
                      selectedRequest.status === CheckoutStatus.PROCESSING ||
                      selectedRequest.status === CheckoutStatus.PENDING_LIQUIDATION) && (
                      <button
                        type="button"
                        onClick={() => {
                          handleCancelRequest(selectedRequest.requestId);
                          closeDetail();
                        }}
                        className="rounded-full border border-red-300 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
                      >
                        Hủy yêu cầu
                      </button>
                    )}
                    <button
                      onClick={closeDetail}
                      className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
