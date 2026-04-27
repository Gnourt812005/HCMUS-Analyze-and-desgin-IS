import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PolicyContentDTO, RentalConditionDTO, UserProfileDTO } from '@dormarch/shared';
import { RentalService } from '../api/RentalService';
import { ApiClient } from '../api/ApiClient';

export const RentalCondition = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { roomName, bedNumbers, dormId: stateDormId } = (location.state as any) || {};

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
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
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
          RentalService.getLatestPolicy(stateDormId)
        ]);

        if (conditionResponse.status === 200) {
          setConditions(conditionResponse.data);
        }

        if (policyResponse.status === 200) {
          setPolicy(policyResponse.data);
        }

        // Fetch profile to pre-fill CCCD
        try {
          const userProfile = await ApiClient.get<UserProfileDTO>('/users/profile');
          if (userProfile && userProfile.cccd) {
            setIdCard(userProfile.cccd);
            setProfile(userProfile);
          }
        } catch (e) {
          console.warn('User not logged in or profile fetch failed');
        }
      } catch (error: any) {
        alert(error.message || 'Không tải được điều kiện thuê.');
      }
    };

    load();
  }, []);
  const [showFastTrack, setShowFastTrack] = useState(false);
  const [fastTrackData, setFastTrackData] = useState<{ registrationId: string } | null>(null);

  const checkExistingDeposit = async (currentIdCard: string) => {
    if (currentIdCard.length !== 12 || loading) return;

    console.log(`[AutoCheck] Checking deposit for ID: ${currentIdCard}, Room: ${roomId}`);
    try {
      const response = await RentalService.checkEligibility({ roomId, bedIds, idCard: currentIdCard });
      console.log(`[AutoCheck] Response:`, response.data);
      if (response.status === 200 && response.data.alreadyDeposited && response.data.existingRegistrationId) {
        setFastTrackData({ registrationId: response.data.existingRegistrationId });
        setShowFastTrack(true);
      }
    } catch (e) {
      console.error('Auto deposit check failed:', e);
    }
  };

  const [autoChecked, setAutoChecked] = useState(false);

  useEffect(() => {
    if (idCard.length === 12 && !autoChecked && !loading) {
      setAutoChecked(true);
      checkExistingDeposit(idCard);
    }
  }, [idCard, autoChecked, loading]);

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

      if (response.data.alreadyDeposited && response.data.existingRegistrationId) {
        setFastTrackData({ registrationId: response.data.existingRegistrationId });
        setShowFastTrack(true);
        setLoading(false);
        return;
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
          lockBedSelection: response.data.lockBedSelection,
          profile,
          roomName,
          bedNumbers
        }
      });
    } catch (error: any) {
      alert(error.message || 'Kiểm tra điều kiện thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFastTrackPayment = async () => {
    if (!fastTrackData) return;
    setLoading(true);
    try {
      const previewResponse = await RentalService.preview({
        registrationId: fastTrackData.registrationId,
        action: 'FULL_PAYMENT'
      });

      if (previewResponse.status === 200) {
        navigate('/rental/payment', {
          state: {
            registrationId: fastTrackData.registrationId,
            action: 'FULL_PAYMENT',
            defaultMethod: 'BANK',
            preview: previewResponse.data
          }
        });
      }
    } catch (error: any) {
      alert(error.message || 'Không thể tải thông tin thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800">Điều kiện thuê</h1>
          <p className="mt-1 text-sm text-slate-600">
            Phòng {roomName || roomId} - Giường {bedNumbers?.join(', ') || bedIds.join(', ')}
          </p>

          {policy && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                <p className="font-bold text-blue-900 uppercase tracking-tight text-xs">{policy.title}</p>
              </div>
              <div>
                {policy.content
                  .split('\n')
                  .map(line => line.replace(/^[•\-]\s*/, '').trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <div key={i} className="flex items-start gap-2 py-2 border-b border-blue-100 last:border-0">
                      <span className="text-sm text-blue-800">{line}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {conditions.map((condition) => (
              <div key={condition.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                <p className="font-semibold text-slate-800 text-sm">{condition.title}</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{condition.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Căn cước công dân (CCCD)</label>
            <input
              value={idCard}
              onChange={(e) => setIdCard(e.target.value.replace(/\D/g, '').slice(0, 12))}
              inputMode="numeric"
              pattern="\d{12}"
              maxLength={12}
              readOnly={!!profile?.cccd}
              placeholder="000000000000"
              className={`mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${profile?.cccd ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''
                }`}
            />
          </div>

          <label className="mt-6 flex items-start gap-3 text-sm text-slate-700 cursor-pointer group">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="group-hover:text-blue-700 transition-colors">Tôi đã đọc và đồng ý với toàn bộ điều kiện thuê.</span>
          </label>

          <button
            onClick={handleContinue}
            disabled={!canContinue || loading}
            className="mt-8 w-full rounded-xl bg-blue-700 px-4 py-4 font-bold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800 active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              'Tiếp tục đăng ký thuê'
            )}
          </button>
        </div>
      </div>

      {showFastTrack && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowFastTrack(false)}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Khoản cọc hiện có</h3>
            <p className="mt-4 text-slate-600 leading-relaxed text-sm">
              Hệ thống phát hiện bạn đã có một khoản đặt cọc thành công cho phòng này. Bạn có muốn chuyển thẳng đến bước thanh toán hoàn tất để nhận phòng ngay không?
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3">
              <button
                onClick={handleFastTrackPayment}
                className="w-full rounded-xl bg-blue-700 py-4 font-bold text-white shadow-lg shadow-blue-700/30 hover:bg-blue-800 transition-all active:scale-[0.98]"
              >
                Thanh toán ngay
              </button>
              <button
                onClick={() => setShowFastTrack(false)}
                className="w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700 hover:bg-slate-200 transition-all"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
