import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiClient } from '../../api/ApiClient';
import { CheckoutRequestDTO, ContractDTO, RefundCalculationDTO, CheckoutStatus } from '@dormarch/shared';

interface DamageInspection {
  roomCondition: string;
  damageSummary: string;
  damageAmount: number;
}

interface AdditionalDeductions {
  unpaidRent: number;
  unpaidUtilities: number;
  compensationFee: number;
  otherDeductions: number;
  otherDeductionsNotes: string;
}

interface CalculationResult {
  initialDeposit: number;
  baseRefundableDeposit: number;
  refundRule: string;
  damageFee: number;
  otherDeductionsTotal: number;
  finalRefundAmount: number;
  customerOwes: boolean;
}

export const AdminRefundCalculation = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [checkoutRequest, setCheckoutRequest] = useState<CheckoutRequestDTO | null>(null);
  const [contract, setContract] = useState<ContractDTO | null>(null);
  const [existingCalculation, setExistingCalculation] = useState<RefundCalculationDTO | null>(null);

  const [damageInspection, setDamageInspection] = useState<DamageInspection>({
    roomCondition: '',
    damageSummary: '',
    damageAmount: 0,
  });

  const [additionalDeductions, setAdditionalDeductions] = useState<AdditionalDeductions>({
    unpaidRent: 0,
    unpaidUtilities: 0,
    compensationFee: 0,
    otherDeductions: 0,
    otherDeductionsNotes: '',
  });

  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Load data on mount
  useEffect(() => {
    const abortController = new AbortController();
    loadData(abortController);
    
    return () => {
      abortController.abort();
    };
  }, [requestId]);

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
      }
      const detailData = await ApiClient.get<DetailResponse>(`/checkout-requests/${requestId}/details`);
      
      if (abortController.signal.aborted) return;
      
      setCheckoutRequest(detailData.request);
      if (detailData.contract) {
        setContract(detailData.contract);
      }

      // Try to load existing calculation
      try {
        const calcData = await ApiClient.get<RefundCalculationDTO>(`/refund-calculations/by-request/${requestId}`);
        if (!abortController.signal.aborted) {
          setExistingCalculation(calcData);
          // Pre-fill the form if calculation exists
          if (calcData.damageFee) {
            setDamageInspection(prev => ({ ...prev, damageAmount: calcData.damageFee }));
          }
        }
      } catch {
        // No existing calculation, which is expected
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

  const calculateRefund = () => {
    if (!contract || !checkoutRequest) {
      setError('Không tìm thấy thông tin hợp đồng hoặc yêu cầu trả phòng.');
      return;
    }

    setError(null);

    // Base deposit amount from contract
    const initialDeposit = contract.depositAmount; // depositAmount is not optional in ContractDTO
    let baseRefundableDeposit = 0;
    let refundRule = '';

    const contractStartDate = new Date(contract.startDate);
    const checkoutDate = new Date(checkoutRequest.expectedDate);

    // Calculate the contract's official end date based on startDate and stayDuration
    const contractOfficialEndDate = new Date(contractStartDate);
    contractOfficialEndDate.setMonth(contractOfficialEndDate.getMonth() + contract.stayDuration);
    // Set to the end of the day to ensure comparison `checkoutDate >= contractOfficialEndDate` works correctly for same-day checkout
    contractOfficialEndDate.setHours(23, 59, 59, 999);

    // Contract expired (or checkout is on the expiry date or later)
    if (checkoutDate >= contractOfficialEndDate) {
      baseRefundableDeposit = initialDeposit; // 100%
      refundRule = 'Hoàn 100% cọc (Hợp đồng hết hạn đúng ngày hoặc sau ngày hết hạn).';
    } else {
      // Early termination
      // To accurately determine if the stay is less than 6 months, we calculate the date 6 months after the start date.
      // This handles month-end cases correctly (e.g., Jan 31 + 6 months = July 31).
      const sixMonthsAfterStart = new Date(contractStartDate);
      const targetMonth = (sixMonthsAfterStart.getMonth() + 6) % 12;
      sixMonthsAfterStart.setMonth(sixMonthsAfterStart.getMonth() + 6);

      // If setMonth() rolled over to the next month (e.g., from Jan 31 to Mar 2),
      // it means the target month was shorter. We correct this by setting the date to 0,
      // which results in the last day of the previous (target) month.
      if (sixMonthsAfterStart.getMonth() !== targetMonth) {
        sixMonthsAfterStart.setDate(0);
      }

      if (checkoutDate < sixMonthsAfterStart) {
        // Stayed < 6 months
        baseRefundableDeposit = initialDeposit * 0.5; // 50%
        refundRule = 'Hoàn 50% cọc (Chấm dứt hợp đồng trước hạn, lưu trú < 6 tháng).';
      }
      else {
        // Stayed >= 6 months
        baseRefundableDeposit = initialDeposit * 0.7; // 70%
        refundRule = 'Hoàn 70% cọc (Chấm dứt hợp đồng trước hạn, lưu trú từ 6 tháng trở lên).';
      }
    }

    const damageFee = damageInspection.damageAmount;
    const otherDeductionsTotal =
      additionalDeductions.unpaidRent +
      additionalDeductions.unpaidUtilities +
      additionalDeductions.compensationFee +
      additionalDeductions.otherDeductions;

    const finalRefundAmount = baseRefundableDeposit - (damageFee + otherDeductionsTotal);

    setCalculationResult({
      initialDeposit,
      baseRefundableDeposit,
      refundRule,
      damageFee,
      otherDeductionsTotal,
      finalRefundAmount,
      customerOwes: finalRefundAmount < 0,
    });
    setHasCalculated(true);
  };

  const handleSaveCalculation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!calculationResult || !checkoutRequest || !contract) {
      setError('Vui lòng hoàn thành phép tính trước khi lưu');
      return;
    }

    if (calculationResult.damageFee < 0 || calculationResult.otherDeductionsTotal < 0) {
      setError('Các khoản chi phí không được âm.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Create or update refund calculation
      const refundData = {
        requestId: checkoutRequest.requestId,
        contractId: contract.contractId,
        depositAmount: calculationResult.initialDeposit,
        damageFee: calculationResult.damageFee,
        extraDebt:
          additionalDeductions.unpaidRent +
          additionalDeductions.unpaidUtilities +
          additionalDeductions.compensationFee +
          additionalDeductions.otherDeductions,
        finalRefundAmount: calculationResult.finalRefundAmount,
        notes: `${calculationResult.refundRule}. Ghi chú thiệt hại: ${
          damageInspection.damageSummary || 'Không'
        }. Ghi chú khoản khác: ${additionalDeductions.otherDeductionsNotes || 'Không'}.`,
      };

      let savedCalculation: RefundCalculationDTO;

      if (existingCalculation) {
        // Update existing
        savedCalculation = await ApiClient.put<RefundCalculationDTO>(
          `/refund-calculations/${existingCalculation.calculationId}`,
          { body: JSON.stringify(refundData) }
        );
      } else {
        // Create new
        savedCalculation = await ApiClient.post<RefundCalculationDTO>('/refund-calculations', {
          body: JSON.stringify(refundData),
        });
      }

      setExistingCalculation(savedCalculation);

      // Update checkout request status to PENDING_LIQUIDATION only after calculation succeeds
      try {
        await ApiClient.patch(`/checkout-requests/${checkoutRequest.requestId}/status`, {
          body: JSON.stringify({
            status: CheckoutStatus.PENDING_LIQUIDATION,
            expectedStatus: checkoutRequest.status
          }),
        });
      } catch (statusErr) {
        // Log the error but don't fail - calculation was saved successfully
        console.error('Failed to update checkout status:', statusErr);
        setError('Lưu bảng đối soát thành công nhưng cập nhật trạng thái thất bại. Vui lòng làm mới trang.');
        return;
      }

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/checkout');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi lưu bảng đối soát');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(value));

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-500">Đang tải thông tin...</div>
      </div>
    );
  }

  if (!checkoutRequest || !contract) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Không tìm thấy yêu cầu hoặc hợp đồng
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tính khoản hoàn cọc và khấu trừ</h1>
        </div>
        <button
          onClick={() => navigate('/admin/checkout')}
          className="inline-flex items-center justify-center rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
        >
          ✕
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
            <div>
              <p className="font-semibold text-green-900">Lưu bảng đối soát thành công!</p>
              <p className="text-sm text-green-700 mt-1">
                Bảng tính hoàn cọc đã được lưu. Bạn sẽ được quay lại danh sách yêu cầu...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !success && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600 mt-0.5">error</span>
            <div>
              <p className="font-semibold text-red-900">Có lỗi xảy ra</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveCalculation} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Thông tin hợp đồng
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 uppercase">Mã hợp đồng</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{contract.contractId}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 uppercase">Phòng / Giường</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{contract.roomId}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 uppercase">Số tiền cọc</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {formatCurrency(contract.depositAmount || 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 uppercase">Thời hạn</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{contract.stayDuration} tháng</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs text-slate-500 uppercase">Ngày tạo yêu cầu</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {new Date(checkoutRequest.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                1
              </span>
              Kiểm tra tình trạng phòng/giường
            </h2>
            <p className="text-sm text-slate-500 mt-2">Ghi nhận kết quả kiểm tra tài sản và thiệt hại</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú về hư hỏng</label>
            <textarea
              value={damageInspection.damageSummary}
              onChange={(e) => setDamageInspection({ ...damageInspection, damageSummary: e.target.value })}
              placeholder="Mô tả chi tiết về những hư hỏng, thiệt hại..."
              rows={3}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Thiệt hại về tiền (tiền phát sinh) *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">₫</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={damageInspection.damageAmount}
                onChange={(e) =>
                  setDamageInspection({ ...damageInspection, damageAmount: parseFloat(e.target.value) || 0 })
                }
                className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Nhập số tiền làm hư hỏng (không có định dạng)</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                2
              </span>
              Khoản chi phí phát sinh cần khấu trừ
            </h2>
            <p className="text-sm text-slate-500 mt-2">Nhập các khoản chi phí bổ sung khác nếu có</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tiền thuê nợ</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">₫</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={additionalDeductions.unpaidRent}
                  onChange={(e) =>
                    setAdditionalDeductions({
                      ...additionalDeductions,
                      unpaidRent: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tiền điện nước nợ</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">₫</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={additionalDeductions.unpaidUtilities}
                  onChange={(e) =>
                    setAdditionalDeductions({
                      ...additionalDeductions,
                      unpaidUtilities: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phí bồi thường</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">₫</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={additionalDeductions.compensationFee}
                  onChange={(e) =>
                    setAdditionalDeductions({
                      ...additionalDeductions,
                      compensationFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Khoản khác</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">₫</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={additionalDeductions.otherDeductions}
                  onChange={(e) =>
                    setAdditionalDeductions({
                      ...additionalDeductions,
                      otherDeductions: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú cho khoản khác</label>
              <textarea
                value={additionalDeductions.otherDeductionsNotes}
                onChange={(e) =>
                  setAdditionalDeductions({
                    ...additionalDeductions,
                    otherDeductionsNotes: e.target.value,
                  })
                }
                placeholder="Mô tả chi tiết khoản khác..."
                rows={2}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={calculateRefund}
            className="rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
          >
            Tính toán tổng
          </button>
        </div>

        {/* Section 5: Calculation Result */}
        {hasCalculated && calculationResult && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">calculate</span>
              Kết quả tính toán
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-sm font-semibold text-slate-700">Tiền cọc ban đầu từ hợp đồng</span>
                <span className="text-lg font-bold text-slate-900">{formatCurrency(calculationResult.initialDeposit)}</span>
              </div>

              <div className="flex justify-between items-center rounded-2xl border border-slate-200 bg-blue-50 p-4">
                <div>
                  <span className="text-sm font-semibold text-slate-700">Tiền cọc được xét hoàn</span>
                  <p className="text-xs text-slate-500">{calculationResult.refundRule}</p>
                </div>
                <span className="text-lg font-bold text-blue-700">
                  {formatCurrency(calculationResult.baseRefundableDeposit)}
                </span>
              </div>

              <div className="flex justify-between items-center rounded-2xl border border-slate-200 bg-red-50 p-4">
                <span className="text-sm font-semibold text-slate-700">Chi phí hư hỏng</span>
                <span className="text-lg font-bold text-red-700">- {formatCurrency(calculationResult.damageFee)}</span>
              </div>

              <div className="flex justify-between items-center rounded-2xl border border-slate-200 bg-orange-50 p-4">
                <span className="text-sm font-semibold text-slate-700">Tổng khoản khác cần khấu trừ</span>
                <span className="text-lg font-bold text-orange-700">
                  - {formatCurrency(calculationResult.otherDeductionsTotal)}
                </span>
              </div>

              <div className="border-t-2 border-slate-200 pt-4">
                <div
                  className={`flex justify-between items-center rounded-2xl border-2 p-4 ${
                    calculationResult.customerOwes
                      ? 'border-red-300 bg-red-50'
                      : 'border-green-300 bg-green-50'
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      calculationResult.customerOwes ? 'text-red-700' : 'text-green-700'
                    }`}
                  >
                    {calculationResult.customerOwes ? 'Khách hàng cần thanh toán thêm' : 'Khách hàng được hoàn trả'}
                  </span>
                  <span
                    className={`text-2xl font-bold ${
                      calculationResult.customerOwes ? 'text-red-700' : 'text-green-700'
                    }`}
                  >
                    {formatCurrency(calculationResult.finalRefundAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Chi tiết khấu trừ</p>
              <ul className="space-y-1 text-sm text-slate-600">
                <li className="flex justify-between">
                  <span>Hư hỏng:</span>
                  <span>{formatCurrency(calculationResult.damageFee)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Tiền thuê nợ:</span>
                  <span>{formatCurrency(additionalDeductions.unpaidRent)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Điện nước nợ:</span>
                  <span>{formatCurrency(additionalDeductions.unpaidUtilities)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Phí bồi thường:</span>
                  <span>{formatCurrency(additionalDeductions.compensationFee)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Khoản khác:</span>
                  <span>{formatCurrency(additionalDeductions.otherDeductions)}</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/checkout')}
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting || !hasCalculated}
            className="rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
};
