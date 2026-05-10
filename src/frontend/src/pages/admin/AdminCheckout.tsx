import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutStatus, CheckoutRequestDTO, RefundCalculationDTO, UserProfileDTO, RentalFormDTO } from '@dormarch/shared';
import { ApiClient } from '../../api/ApiClient';

export const AdminCheckout = () => {
  const navigate = useNavigate();
  const [checkoutRequests, setCheckoutRequests] = useState<CheckoutRequestDTO[]>([]);
  const [refundMap, setRefundMap] = useState<Record<string, RefundCalculationDTO>>({});
  const [loading, setLoading] = useState(true);
  const [modalRefundLoading, setModalRefundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<CheckoutRequestDTO | null>(null);
  const [selectedRentalForm, setSelectedRentalForm] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form create
  const [createForm, setCreateForm] = useState({
    userEmail: '',
    rentalFormId: '',
    expectedDate: '',
  });
  const [searchingUser, setSearchingUser] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);
  const [searchedUser, setSearchedUser] = useState<UserProfileDTO | null>(null);
  const [availableContracts, setAvailableContracts] = useState<RentalFormDTO[]>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<CheckoutStatus | 'all'>('all');
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Load checkout requests on mount
  useEffect(() => {
    const abortController = new AbortController();
    loadCheckoutRequests(abortController);
    
    return () => {
      abortController.abort();
    };
  }, []);
  // Load refund calculation when detail modal opens
  useEffect(() => {
    if (!showDetailModal || !selectedRequest) {
      setModalRefundLoading(false);
      return;
    }

    const loadRefund = async () => {
      setModalRefundLoading(true);
      try {
        const refund = await ApiClient.get<RefundCalculationDTO>(
          `/refund-calculations/by-request/${selectedRequest.requestId}`
        );
        setRefundMap(prev => ({
          ...prev,
          [selectedRequest.requestId]: refund
        }));
      } catch (err) {
        console.error('Failed to load refund calculation:', err);
      } finally {
        setModalRefundLoading(false);
      }
    };

    loadRefund();
  }, [showDetailModal, selectedRequest?.requestId]);
  const loadCheckoutRequests = async (abortController: AbortController) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiClient.get<CheckoutRequestDTO[]>('/checkout-requests');
      
      if (abortController.signal.aborted) return;
      
      setCheckoutRequests(response || []);

      // Load refund calculations for all requests in parallel
      const refundPromises = (response || []).map(request =>
        ApiClient.get<RefundCalculationDTO>(`/refund-calculations/by-request/${request.requestId}`)
          .then(refund => ({ requestId: request.requestId, refund }))
          .catch(() => ({ requestId: request.requestId, refund: null }))
      );
      
      const refundResults = await Promise.all(refundPromises);
      
      if (abortController.signal.aborted) return;
      
      const refunds: Record<string, RefundCalculationDTO> = {};
      refundResults.forEach(result => {
        if (result.refund) {
          refunds[result.requestId] = result.refund;
        }
      });
      setRefundMap(refunds);
    } catch (err) {
      if (!abortController.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
        setCheckoutRequests([]);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  // Tạo yêu cầu trả phòng
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!createForm.userEmail || !createForm.rentalFormId || !createForm.expectedDate) {
      setError('Vui lòng điền đầy đủ thông tin và chọn đơn đăng ký thuê.');
      return;
    }

    try {
      const newRequest = await ApiClient.post<CheckoutRequestDTO>('/checkout-requests', {
        body: JSON.stringify({
          userEmail: createForm.userEmail,
          rentalFormId: createForm.rentalFormId,
          expectedDate: createForm.expectedDate,
        })
      });
      
      // Optimistic update - thêm yêu cầu mới vào danh sách ngay lập tức
      setCheckoutRequests(prev => [...prev, newRequest]);
      
      setShowCreateModal(false);
      setCreateForm({ userEmail: '', rentalFormId: '', expectedDate: '' });
      setSearchingUser(false);
      setUserSearchError(null);
      setSearchedUser(null);
      setAvailableContracts([]);
      setError(null);
      await loadCheckoutRequests(new AbortController()); // Re-fetch to get the latest state including refund calculations
      showSuccess(`Đã tạo yêu cầu trả phòng mới thành công!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo yêu cầu');
    }
  };

  const handleSearchUser = async () => {
    if (!createForm.userEmail) {
      setUserSearchError('Vui lòng nhập Email khách hàng để tìm kiếm.');
      return;
    }

    setSearchingUser(true);
    setUserSearchError(null);
    setSearchedUser(null);
    setAvailableContracts([]);
    setCreateForm(prev => ({ ...prev, rentalFormId: '' }));

    try {
      // Fetch rental forms for the searched customer
      const response = await ApiClient.get<RentalFormDTO[]>(
        `/checkout-requests/rental-forms/available?userEmail=${encodeURIComponent(createForm.userEmail)}`
      );

      if (!response || response.length === 0) {
        setUserSearchError('Khách hàng không có đơn đăng ký thuê nào.');
        setSearchingUser(false);
        return;
      }

      setSearchedUser({ email: createForm.userEmail, fullName: response[0].user_full_name });
      setAvailableContracts(response);
    } catch (err) {
      setUserSearchError(err instanceof Error ? err.message : 'Lỗi tìm kiếm khách hàng');
      setSearchedUser(null);
      setAvailableContracts([]);
    } finally {
      setSearchingUser(false);
    }
  };

  // Xem chi tiết
  const handleViewDetail = async (request: CheckoutRequestDTO) => {
    setSelectedRequest(request);
    setSelectedRentalForm(null);
    setShowDetailModal(true);
    
    // Load rental form info to check if it has a contract
    try {
      const detailData = await ApiClient.get<any>(`/checkout-requests/${request.requestId}/details`);
      
      if (detailData && detailData.rentalForm) {
        setSelectedRentalForm(detailData.rentalForm);
      }
    } catch (err) {
      console.error('Failed to load rental form:', err);
    }
  };

  // Tiếp nhận (chuyển từ PENDING -> PROCESSING)
  const handleAccept = async (requestId: string) => {
    try {
      setCheckoutRequests(
        prev => prev.map(r => r.requestId === requestId ? { ...r, status: CheckoutStatus.PROCESSING } : r)
      );
      
      const request = checkoutRequests.find(r => r.requestId === requestId);
      await ApiClient.patch(`/checkout-requests/${requestId}/status`, {
        body: JSON.stringify({
          status: CheckoutStatus.PROCESSING,
          expectedStatus: request?.status
        })
      });
      
      // Wait a moment for backend to auto-generate refund
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await loadCheckoutRequests(new AbortController());
      
      // Reload the refund for the current request to show updated modal
      if (selectedRequest) {
        try {
          const refund = await ApiClient.get<RefundCalculationDTO>(
            `/refund-calculations/by-request/${selectedRequest.requestId}`
          );
          setRefundMap(prev => ({
            ...prev,
            [selectedRequest.requestId]: refund
          }));
          // Update selected request to show new status
          setSelectedRequest(prev => prev ? { ...prev, status: CheckoutStatus.PROCESSING } : null);
        } catch (err) {
          console.error('Failed to load refund:', err);
        }
      }
      
      setError(null);
      showSuccess('Đã tiếp nhận yêu cầu trả phòng!');
      // Close modal after acceptance
      setShowDetailModal(false);
    } catch (err) {
      // Rollback
      setCheckoutRequests(prev => prev.map(r => r.requestId === requestId ? { ...r, status: CheckoutStatus.PENDING } : r));
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái');
    }
  };

  // Hủy yêu cầu
  const handleCancelRequest = async (requestId: string) => {
    const request = checkoutRequests.find(r => r.requestId === requestId);
    try {
      setCheckoutRequests(
        prev => prev.map(r => r.requestId === requestId ? { ...r, status: CheckoutStatus.CANCELLED } : r)
      );
      
      await ApiClient.patch(`/checkout-requests/${requestId}/status`, {
        body: JSON.stringify({
          status: CheckoutStatus.CANCELLED,
          expectedStatus: request?.status
        })
      });
      
      setError(null);
      showSuccess('Đã hủy yêu cầu trả phòng.');
      setShowDetailModal(false);
    } catch (err) {
      // Rollback
      setCheckoutRequests(prev => prev.map(r => r.requestId === requestId ? { ...r, status: request?.status || CheckoutStatus.PENDING } : r));
      setError(err instanceof Error ? err.message : 'Lỗi hủy yêu cầu');
    }
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

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const stats = useMemo(() => ({
    total: checkoutRequests.length,
    pending: checkoutRequests.filter(r => r.status === CheckoutStatus.PENDING).length,
    processing: checkoutRequests.filter(r => r.status === CheckoutStatus.PROCESSING).length,
    completed: checkoutRequests.filter(r => r.status === CheckoutStatus.LIQUIDATED).length,
  }), [checkoutRequests]);

  const filtered = useMemo(() => checkoutRequests.filter(r => {
    const kw = keyword.toLowerCase();
    const matchKw = !keyword || r.requestId.toLowerCase().includes(kw) || r.userEmail.toLowerCase().includes(kw) || r.rentalFormId?.toLowerCase().includes(kw);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchKw && matchStatus;
  }), [checkoutRequests, keyword, statusFilter]);

  const FILTER_OPTIONS: { val: CheckoutStatus | 'all', label: string }[] = [
    { val: 'all', label: 'Tất cả' },
    { val: CheckoutStatus.PENDING, label: 'Chờ xử lý' },
    { val: CheckoutStatus.PROCESSING, label: 'Đang xử lý' },
    { val: CheckoutStatus.LIQUIDATED, label: 'Đã thanh lý' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Yêu cầu Trả phòng</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý và đối soát thông tin trả phòng của khách hàng</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-blue-200"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Tạo yêu cầu mới
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng yêu cầu', value: stats.total, icon: 'receipt_long', color: 'text-blue-600 bg-blue-50' },
          { label: 'Chờ tiếp nhận', value: stats.pending, icon: 'pending_actions', color: 'text-amber-600 bg-amber-50' },
          { label: 'Đang xử lý', value: stats.processing, icon: 'sync', color: 'text-purple-600 bg-purple-50' },
          { label: 'Đã thanh lý', value: stats.completed, icon: 'check_circle', color: 'text-emerald-600 bg-emerald-50' },
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

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Tìm theo mã yêu cầu, Email, đơn đăng ký..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map(s => (
            <button
              key={s.val}
              onClick={() => setStatusFilter(s.val)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === s.val ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[1024px] text-sm table-fixed">
            <colgroup>
              <col className="w-[10%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Mã YC</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Khách hàng</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Phòng/Giường</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Tài chính</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Lịch trình</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-slate-400"><div className="flex flex-col items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl mb-3">autorenew</span><p className="font-medium">Đang tải dữ liệu...</p></div></td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-slate-400"><div className="flex flex-col items-center justify-center"><span className="material-symbols-outlined text-5xl mb-3">assignment_return</span><p className="font-medium">Không tìm thấy yêu cầu phù hợp</p></div></td>
                </tr>
              ) : (
                filtered.map((request) => (
                  <tr key={request.code} className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => handleViewDetail(request)}>
                    <td className="px-5 py-4 font-bold text-blue-700 break-words">{request.code}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 truncate">{request.userFullName || 'N/A'}</p>
                      <p className="text-xs text-slate-500 truncate">{request.userEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700 truncate">{request.dormName} - Tầng {request.floor}</p>
                      <p className="text-xs text-slate-500 truncate">Phòng: {request.roomName}</p>
                    </td>
                    <td className="px-5 py-4">
                      {refundMap[request.requestId] ? (
                        <p className="font-bold text-slate-800">{formatMoney(refundMap[request.requestId].finalRefundAmount)}</p>
                      ) : (
                        <p className="text-slate-400 text-xs italic">Chưa đối soát</p>
                      )}
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
                    <td className="px-5 py-4 text-center">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700">
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && filtered.length > 0 && (
              <tfoot>
                <tr className="bg-white">
                  <td colSpan={7} className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
                    Hiển thị {filtered.length} / {checkoutRequests.length} yêu cầu
                  </td>
                </tr>
              </tfoot>
            )}
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Khởi tạo yêu cầu trả phòng</h2>
                <p className="text-slate-500 text-sm mt-0.5">Tạo yêu cầu cho khách hàng đang có đơn đăng ký thuê</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Email khách hàng *
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                  value={createForm.userEmail}
                    onChange={(e) => {
                    setCreateForm({ ...createForm, userEmail: e.target.value, rentalFormId: '' });
                      setSearchedUser(null);
                      setAvailableContracts([]);
                      setUserSearchError(null);
                    }}
                  placeholder="Nhập Email..."
                    className="flex-1 bg-slate-50 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                  disabled={!createForm.userEmail || searchingUser}
                    onClick={handleSearchUser}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-lg transition-all disabled:opacity-50"
                  >
                    {searchingUser ? 'Đang tìm...' : 'Tìm khách hàng'}
                  </button>
                </div>
                {userSearchError && (
                  <p className="text-xs text-red-500">{userSearchError}</p>
                )}
              </div>

              {searchedUser && (
                <div className="bg-blue-50 rounded-xl p-4 flex gap-6 text-sm">
                  <div>
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Khách hàng</p>
                    <p className="font-bold text-slate-800">{searchedUser.fullName || 'Không rõ tên'}</p>
                  </div>
                  <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Email</p>
                  <p className="font-bold text-slate-800">{searchedUser.email}</p>
                  </div>
                </div>
              )}

              {availableContracts.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Chọn đơn đăng ký thuê *</label>
                  <div className="grid gap-3">
                    {availableContracts.map((rental) => (
                      <label
                        key={rental.rentalFormId}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          createForm.rentalFormId === rental.rentalFormId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-100 bg-white hover:border-blue-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rentalFormId"
                          value={rental.rentalFormId}
                          checked={createForm.rentalFormId === rental.rentalFormId}
                          onChange={(e) => setCreateForm({ ...createForm, rentalFormId: e.target.value })}
                          className="mt-1"
                        />
                        <div className="flex-1 text-sm text-slate-700">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-900">{rental.dormName} - Tầng {rental.floor} - Phòng {rental.roomName}</p>
                            <span className="px-2 py-1 text-xs font-medium rounded bg-amber-100 text-amber-800">
                              {rental.type === 'DEPOSIT' ? 'Cọc' : 'Thuê'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">Giường: {rental.bedNumbers}</p>
                          {rental.contractId && (
                            <p className="text-xs">Hạn: {new Date(rental.startDate!).toLocaleDateString('vi-VN')}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Ngày dự kiến trả *
                </label>
                <input
                  type="date"
                  value={createForm.expectedDate}
                  onChange={(e) => setCreateForm({ ...createForm, expectedDate: e.target.value })}
                  className="w-full bg-slate-50 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                setCreateForm({ userEmail: '', rentalFormId: '', expectedDate: '' });
                  setSearchingUser(false);
                  setUserSearchError(null);
                  setSearchedUser(null);
                  setAvailableContracts([]);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
              >
                Huỷ
              </button>
              <button
                onClick={handleCreateRequest}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-base">save</span>
                Lưu yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => {
            setShowDetailModal(false);
            setSelectedRentalForm(null);
          }} />
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
                <button onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRentalForm(null);
                }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors mt-1">
                  <span className="material-symbols-outlined text-slate-500">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Khách hàng</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedRequest.userFullName || selectedRequest.userEmail}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đơn đăng ký</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedRequest.rentalFormId}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ký túc xá</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedRequest.dormName}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Phòng</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedRequest.roomName}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tầng</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedRequest.floor}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Giường</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedRequest.bedNumbers}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ngày tạo</span>
                  <span className="text-sm font-semibold text-slate-800">{new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ngày dự kiến trả</span>
                  <span className="text-sm font-semibold text-slate-800">{new Date(selectedRequest.expectedDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {modalRefundLoading ? (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 animate-spin">autorenew</span>
                  <span className="text-sm font-medium">Đang tải bảng đối soát...</span>
                </div>
              ) : refundMap[selectedRequest.requestId] ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Bảng tính đối soát</h3>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                  <div className="pl-10 space-y-2">
                    <div className="flex items-center justify-between py-2.5 border-b border-dashed border-slate-200">
                      <span className="text-sm text-slate-600">Cọc theo đơn đăng ký</span>
                      <span className="text-sm font-bold text-slate-800">{formatMoney(refundMap[selectedRequest.requestId].depositAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-dashed border-slate-200">
                      <span className="text-sm text-slate-600">Phí hư hỏng (-khấu trừ)</span>
                      <span className="text-sm font-bold text-red-600">-{formatMoney(refundMap[selectedRequest.requestId].damageFee)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-slate-200">
                      <span className="text-sm text-slate-600">Phí phát sinh nợ (-khấu trừ)</span>
                      <span className="text-sm font-bold text-red-600">-{formatMoney(refundMap[selectedRequest.requestId].extraFee)}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm font-bold text-slate-800">Khoản hoàn / Cần đóng</span>
                      <span className="text-lg font-black text-blue-700">{formatMoney(refundMap[selectedRequest.requestId].finalRefundAmount)}</span>
                    </div>
                  </div>

                  {refundMap[selectedRequest.requestId].notes && (
                    <div className="pl-10 mt-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ghi chú đối soát</p>
                      <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 whitespace-pre-wrap">
                        {refundMap[selectedRequest.requestId].notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                  <span className="text-sm font-medium">Chưa có bảng đối soát</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <div>
                {(selectedRequest.status === CheckoutStatus.PENDING || selectedRequest.status === CheckoutStatus.PROCESSING) && (
                  <button
                    onClick={() => handleCancelRequest(selectedRequest.requestId)}
                    className="flex items-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-all"
                  >
                    <span className="material-symbols-outlined text-base">cancel</span>
                    Huỷ yêu cầu
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedRentalForm(null);
                  }} 
                  className="px-5 py-2.5 text-sm font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-all">
                  Đóng
                </button>
                
                {selectedRequest.status === CheckoutStatus.PENDING && (
                  <button
                    onClick={() => handleAccept(selectedRequest.requestId)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Tiếp nhận
                  </button>
                )}
                
                {selectedRequest.status === CheckoutStatus.PROCESSING && !refundMap[selectedRequest.requestId] && selectedRentalForm?.contract_id && (
                  <button
                    onClick={() => navigate(`/admin/checkout/${selectedRequest.requestId}/refund-calculation`)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-all"
                  >
                    <span className="material-symbols-outlined text-base">calculate</span>
                    Tính hoàn cọc
                  </button>
                )}
                
                {selectedRequest.status === CheckoutStatus.PROCESSING && refundMap[selectedRequest.requestId] && (
                  <button
                    onClick={() => navigate(`/admin/checkout/${selectedRequest.requestId}/liquidation`)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-all"
                  >
                    <span className="material-symbols-outlined text-base">task_alt</span>
                    Hoàn tất trả phòng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
