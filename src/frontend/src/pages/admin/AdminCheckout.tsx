import { useState, useEffect } from 'react';
import { CheckoutStatus, CheckoutRequestDTO } from '@dormarch/shared';
import { ApiClient } from '../../api/ApiClient';

export const AdminCheckout = () => {
  const [checkoutRequests, setCheckoutRequests] = useState<CheckoutRequestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<CheckoutRequestDTO | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form create
  const [createForm, setCreateForm] = useState({
    customerId: '',
    expectedDate: '',
    documentFile: null as File | null
  });
  const [documentFileName, setDocumentFileName] = useState('');

  // Load checkout requests on mount
  useEffect(() => {
    loadCheckoutRequests();
  }, []);

  const loadCheckoutRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiClient.get<CheckoutRequestDTO[]>('/checkout-requests');
      setCheckoutRequests(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
      setCheckoutRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Kịch bản 2: Tạo yêu cầu trả phòng
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!createForm.customerId || !createForm.expectedDate) {
      setError('Trường này không được để trống');
      return;
    }

    try {
      let documentUrl = '';
      
      // Convert file to base64 if selected
      if (createForm.documentFile) {
        documentUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(createForm.documentFile!);
        });
      }

      const newRequest = await ApiClient.post<CheckoutRequestDTO>('/checkout-requests', {
        body: JSON.stringify({
          customerId: createForm.customerId,
          expectedDate: createForm.expectedDate,
          documentUrl: documentUrl
        })
      });
      
      // Optimistic update - thêm yêu cầu mới vào danh sách ngay lập tức
      setCheckoutRequests([...checkoutRequests, newRequest]);
      
      setShowCreateModal(false);
      setCreateForm({ customerId: '', expectedDate: '', documentFile: null });
      setDocumentFileName('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo yêu cầu');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Tệp quá lớn (tối đa 10MB)');
        return;
      }
      setCreateForm({ ...createForm, documentFile: file });
      setDocumentFileName(file.name);
      setError(null);
    }
  };

  // Kịch bản 1: Xem chi tiết
  const handleViewDetail = (request: CheckoutRequestDTO) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  // Kịch bản 3: Tiếp nhận (chuyển từ PENDING -> PROCESSING)
  const handleAccept = async () => {
    if (!selectedRequest) return;

    try {
      // Gọi API
      await ApiClient.patch(`/checkout-requests/${selectedRequest.requestId}/status`, {
        body: JSON.stringify({ status: CheckoutStatus.PROCESSING })
      });

      // Optimistic update - cập nhật ngay trong state
      const updatedRequest = { ...selectedRequest, status: CheckoutStatus.PROCESSING };
      setCheckoutRequests(
        checkoutRequests.map(r => r.requestId === selectedRequest.requestId ? updatedRequest : r)
      );
      
      setShowDetailModal(false);
      setSelectedRequest(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái');
    }
  };

  // Kịch bản 4: Hủy yêu cầu
  const handleCancelRequest = async () => {
    if (!selectedRequest) return;

    try {
      // Gọi API
      await ApiClient.patch(`/checkout-requests/${selectedRequest.requestId}/status`, {
        body: JSON.stringify({ status: CheckoutStatus.CANCELLED })
      });

      // Optimistic update - cập nhật ngay trong state
      const updatedRequest = { ...selectedRequest, status: CheckoutStatus.CANCELLED };
      setCheckoutRequests(
        checkoutRequests.map(r => r.requestId === selectedRequest.requestId ? updatedRequest : r)
      );
      
      setShowDetailModal(false);
      setSelectedRequest(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi hủy yêu cầu');
    }
  };

  const getStatusColor = (status: CheckoutStatus) => {
    switch (status) {
      case CheckoutStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case CheckoutStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case CheckoutStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case CheckoutStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: CheckoutStatus) => {
    switch (status) {
      case CheckoutStatus.PENDING:
        return 'Chờ xử lý';
      case CheckoutStatus.PROCESSING:
        return 'Đang xử lý';
      case CheckoutStatus.REJECTED:
        return 'Từ chối';
      case CheckoutStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý Yêu cầu Trả phòng</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          + Tạo yêu cầu mới
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 font-bold">✕</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Đang tải dữ liệu...
          </div>
        ) : checkoutRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Không có yêu cầu trả phòng
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Mã Yêu cầu
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Mã Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Ngày Dự kiến
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Ngày Tạo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {checkoutRequests.map((request) => (
                  <tr
                    key={request.requestId}
                    className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm text-slate-900">
                      {request.requestId}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-900">
                      {request.customerId}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-900">
                      {new Date(request.expectedDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-900">
                      {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => handleViewDetail(request)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
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

      {/* Modal: Tạo yêu cầu mới (Kịch bản 2) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Tạo Yêu cầu Trả phòng</h2>

            <form onSubmit={handleCreateRequest} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  CCCD Khách hàng *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.customerId}
                  onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
                  placeholder="Nhập mã khách hàng"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ngày dự kiến Trả *
                </label>
                <input
                  type="date"
                  required
                  value={createForm.expectedDate}
                  onChange={(e) => setCreateForm({ ...createForm, expectedDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Đính kèm Tài liệu
                </label>
                <div className="w-full border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="document-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label htmlFor="document-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500 text-3xl group-hover:scale-110 transition-transform">cloud_upload</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {documentFileName || 'Tải tệp lên hoặc kéo thả'}
                    </span>
                    <span className="text-xs text-slate-500">
                      PDF, JPG, PNG, DOC, DOCX (Tối đa 10MB)
                    </span>
                  </label>
                </div>
                {documentFileName && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>{documentFileName}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ customerId: '', expectedDate: '', documentUrl: '' });
                  }}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Quay lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chi tiết Yêu cầu (Kịch bản 1, 3, 4) */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Chi tiết Yêu cầu Trả phòng</h2>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Mã Yêu cầu
                </label>
                <p className="text-slate-900">{selectedRequest.requestId}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  CCCD Khách hàng
                </label>
                <p className="text-slate-900">{selectedRequest.customerId}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Ngày Dự kiến Trả
                </label>
                <p className="text-slate-900">
                  {new Date(selectedRequest.expectedDate).toLocaleDateString('vi-VN')}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Trạng thái
                </label>
                <p className="text-slate-900">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedRequest.status
                    )}`}
                  >
                    {getStatusLabel(selectedRequest.status)}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Ngày Tạo
                </label>
                <p className="text-slate-900">
                  {new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {selectedRequest.documentUrl && (
                <div>
                  <a
                    href={selectedRequest.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Xem tài liệu
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons - Kịch bản 3 & 4 */}
            <div className="flex flex-col gap-2">
              {selectedRequest.status === CheckoutStatus.PENDING && (
                <>
                  <button
                    onClick={handleAccept}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Tiếp nhận
                  </button>
                  <button
                    onClick={handleCancelRequest}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Hủy yêu cầu
                  </button>
                </>
              )}
              {selectedRequest.status === CheckoutStatus.PROCESSING && (
                <button
                  onClick={handleCancelRequest}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Hủy yêu cầu
                </button>
              )}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRequest(null);
                }}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
