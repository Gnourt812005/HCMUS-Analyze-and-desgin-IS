import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PolicyContentDTO, RentalConditionDTO } from '@dormarch/shared';
import { RentalService } from '../api/RentalService';

export const RentalCondition = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roomId = searchParams.get('roomId') || '';
  const bedIds = useMemo(() => {
    const raw = searchParams.get('bedIds') || '';
    return raw
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }, [searchParams]);

  const [conditions, setConditions] = useState<RentalConditionDTO[]>([]);
  const [policy, setPolicy] = useState<PolicyContentDTO | null>(null);
  const [idCard, setIdCard] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const canContinue = useMemo(() => {
    return roomId.length > 0 && bedIds.length > 0 && accepted && idCard.trim().length === 12;
  }, [roomId, bedIds, accepted, idCard]);

  useEffect(() => {
    const load = async () => {
      try {
        const [conditionResponse, policyResponse] = await Promise.all([
          RentalService.getConditions(),
          RentalService.getLatestPolicy()
        ]);

        if (conditionResponse.status === 200) {
          setConditions(conditionResponse.data);
        }

        if (policyResponse.status === 200) {
          setPolicy(policyResponse.data);
        }
      } catch (error: any) {
        alert(error.message || 'Không tải được điều kiện thuê.');
      }
    };

    load();
  }, []);

  const handleContinue = async () => {
    if (!canContinue) return;

    setLoading(true);
    try {
      const response = await RentalService.checkEligibility({ roomId, bedIds, idCard });
      if (response.status !== 200 || !response.data.eligible) {
        const reasons = response.data?.reasons?.join('\n') || 'Không đủ điều kiện thuê.';
        alert(reasons);
        return;
      }

      if (response.data.alreadyDeposited) {
        alert('Bạn đã có lịch sử đặt cọc phòng này. Hệ thống sẽ khóa lựa chọn giường theo quy trình.');
      }

      const agreementResponse = await RentalService.confirmPolicyAgreement({ customerId: idCard });
      if (agreementResponse.status !== 200) {
        alert('Không thể lưu xác nhận đồng ý quy định. Vui lòng thử lại.');
        return;
      }

      navigate('/rental/register', {
        state: {
          roomId,
          bedIds,
          idCard,
          acceptedConditions: true,
          alreadyDeposited: response.data.alreadyDeposited,
          lockBedSelection: response.data.lockBedSelection
        }
      });
    } catch (error: any) {
      alert(error.message || 'Kiểm tra điều kiện thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-800">Điều kiện thuê</h1>
        <p className="mt-1 text-sm text-slate-600">Phòng {roomId} - Giường {bedIds.join(', ')}</p>

        {policy && (
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
            <p className="font-semibold text-blue-800">{policy.title}</p>
            <p className="mt-1 text-sm text-blue-700">{policy.content}</p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {conditions.map((condition) => (
            <div key={condition.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">{condition.title}</p>
              <p className="mt-1 text-sm text-slate-600">{condition.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold text-slate-700">CCCD</label>
          <input
            value={idCard}
            onChange={(e) => setIdCard(e.target.value)}
            placeholder="Nhập CCCD để kiểm tra lịch sử cọc"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
          />
        </div>

        <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1"
          />
          Tôi đồng ý với toàn bộ điều kiện thuê.
        </label>

        <button
          onClick={handleContinue}
          disabled={!canContinue || loading}
          className="mt-6 w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:bg-slate-300"
        >
          {loading ? 'Đang kiểm tra...' : 'Tiếp tục đăng ký thuê'}
        </button>
      </div>
    </div>
  );
};
