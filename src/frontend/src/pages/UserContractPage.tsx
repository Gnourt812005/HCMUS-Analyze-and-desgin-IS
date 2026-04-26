import { useEffect, useState } from 'react';
import { ContractDTO, ContractStatus, UserProfileDTO } from '@dormarch/shared';
import { ApiClient } from '../api/ApiClient';
import { ContractService } from '../api/ContractService';
import { HandoverService, HandoverReport } from '../api/HandoverService';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_RENT_PER_BED = 1_500_000;

const SERVICE_FEES = [
  { name: 'Điện',             price: '3.500 đ/kWh',           note: 'Theo chỉ số công tơ, thanh toán cuối tháng' },
  { name: 'Nước',             price: '50.000 đ/người/tháng',  note: 'Định mức 4m³/người, vượt tính thêm' },
  { name: 'Internet & Wifi',  price: '50.000 đ/phòng/tháng', note: 'Tốc độ tối thiểu 50 Mbps' },
  { name: 'Vệ sinh chung',    price: '30.000 đ/người/tháng', note: 'Bao gồm hành lang và khu vực sinh hoạt chung' },
  { name: 'Bảo vệ & an ninh', price: 'Miễn phí',             note: 'Hoạt động 24/7' },
];

const DEPOSIT_RULES = [
  { icon: 'check_circle',  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', title: 'Hoàn trả 100% tiền cọc',    detail: 'Không có hư hỏng tài sản, thanh toán đầy đủ các khoản phí, và thông báo chấm dứt hợp đồng trước ít nhất 30 ngày.' },
  { icon: 'remove_circle', color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',     title: 'Khấu trừ chi phí sửa chữa', detail: 'Trường hợp có hư hỏng tài sản được ghi nhận trong biên bản bàn giao, chi phí sửa chữa sẽ được khấu trừ trực tiếp vào tiền cọc.' },
  { icon: 'cancel',        color: 'text-red-600',     bg: 'bg-red-50 border-red-200',         title: 'Không hoàn trả tiền cọc',   detail: 'Vi phạm hợp đồng nghiêm trọng, tự ý rời đi không báo trước, hoặc còn nợ phí chưa thanh toán sau khi trừ tiền cọc.' },
];

const HOUSE_RULES = [
  { icon: 'volume_off',          text: 'Không gây tiếng ồn sau 22:00 và trước 06:00.' },
  { icon: 'smoke_free',          text: 'Cấm hút thuốc lá trong toàn bộ khuôn viên ký túc xá.' },
  { icon: 'pets',                text: 'Không nuôi thú cưng dưới mọi hình thức.' },
  { icon: 'lock',                text: 'Khoá cửa phòng khi ra ngoài và khi đi ngủ.' },
  { icon: 'no_food',             text: 'Không nấu ăn trong phòng, chỉ sử dụng bếp sinh hoạt chung.' },
  { icon: 'people',              text: 'Không cho người ngoài ở lại qua đêm khi chưa đăng ký.' },
  { icon: 'cleaning_services',   text: 'Giữ vệ sinh phòng và khu vực sinh hoạt chung sạch sẽ.' },
  { icon: 'electrical_services', text: 'Không sử dụng thiết bị điện công suất lớn chưa được phê duyệt.' },
];

const VIOLATION_TERMS = [
  { level: 'Lần 1', badge: 'bg-yellow-100 text-yellow-800', action: 'Nhắc nhở bằng văn bản', detail: 'Ban quản lý gửi thông báo nhắc nhở và yêu cầu cam kết không tái phạm.' },
  { level: 'Lần 2', badge: 'bg-orange-100 text-orange-800', action: 'Phạt tiền 500.000 đ',    detail: 'Áp dụng mức phạt theo quy định. Số tiền phạt được khấu trừ vào tiền cọc hoặc thanh toán trực tiếp.' },
  { level: 'Lần 3', badge: 'bg-red-100 text-red-800',       action: 'Chấm dứt hợp đồng',     detail: 'Ban quản lý có quyền đơn phương chấm dứt hợp đồng và yêu cầu bàn giao phòng trong vòng 7 ngày.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n: number) { return n.toLocaleString('vi-VN') + ' đ'; }
function fmtDate(iso?: string) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('vi-VN'); } catch { return iso; }
}
function calcEndDate(startDate: string, stayDuration: number) {
  try {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + stayDuration);
    return d.toISOString().split('T')[0];
  } catch { return ''; }
}

type UIStatus = 'Hiệu lực' | 'Đã chấm dứt' | 'Đã thanh lý';
function toUIStatus(s?: ContractStatus): UIStatus {
  if (s === ContractStatus.TERMINATED) return 'Đã chấm dứt';
  if (s === ContractStatus.LIQUIDATED) return 'Đã thanh lý';
  return 'Hiệu lực';
}
const STATUS_STYLE: Record<UIStatus, string> = {
  'Hiệu lực':    'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Đã chấm dứt': 'bg-slate-100  text-slate-500  border-slate-200',
  'Đã thanh lý': 'bg-blue-50    text-blue-700   border-blue-200',
};
const STATUS_DOT: Record<UIStatus, string> = {
  'Hiệu lực':    'bg-emerald-500',
  'Đã chấm dứt': 'bg-slate-400',
  'Đã thanh lý': 'bg-blue-500',
};

const EQUIPMENT_STATUS_STYLE: Record<string, string> = {
  'Tốt':     'text-emerald-600',
  'Hư hỏng': 'text-amber-600',
  'Mất':     'text-red-600',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle = ({ number, title }: { number: string; title: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">{number}</span>
    <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">{title}</h3>
    <div className="flex-1 h-px bg-slate-200" />
  </div>
);

// ─── Detail Panel ─────────────────────────────────────────────────────────────

type DetailTab = 'info' | 'terms' | 'handover';

const ContractDetail = ({
  contract,
  profile,
  handovers,
  handoverLoading,
}: {
  contract: ContractDTO;
  profile: UserProfileDTO | null;
  handovers: HandoverReport[];
  handoverLoading: boolean;
}) => {
  const [tab, setTab] = useState<DetailTab>('info');

  const uiStatus = toUIStatus(contract.status);
  const beds = contract.bedNumbers?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  const bedCount = beds.length || 1;
  const totalRent = BASE_RENT_PER_BED * bedCount;
  const endDate = contract.startDate && contract.stayDuration
    ? calcEndDate(contract.startDate, contract.stayDuration) : '';

  const tabs: [DetailTab, string][] = [
    ['info',     'Thông tin hợp đồng'],
    ['terms',    'Điều khoản & Nội quy'],
    ['handover', 'Biên bản bàn giao'],
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col" style={{ minHeight: '600px' }}>
      {/* Header */}
      <div className="px-7 py-5 border-b border-slate-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900 font-mono">{contract.contractId?.slice(0, 8)}...</h2>
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[uiStatus]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[uiStatus]}`} />
                {uiStatus}
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              Lập ngày {fmtDate(contract.createdAt)}
              {contract.rentalFormId && ` · Phiếu ${contract.rentalFormId.slice(0, 8)}...`}
            </p>
          </div>
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit flex-wrap">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                tab === key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Thông tin ── */}
      {tab === 'info' && (
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
          <div className="text-center py-4 border border-slate-200 rounded-xl bg-slate-50">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Cộng hoà Xã hội Chủ nghĩa Việt Nam</p>
            <p className="text-xs text-slate-400 mb-3">Độc lập – Tự do – Hạnh phúc</p>
            <p className="text-lg font-black uppercase tracking-wide text-slate-800">Hợp đồng Thuê Phòng Ký túc xá</p>
            <p className="text-sm text-slate-500 mt-1">Số: <span className="font-bold text-slate-700 font-mono">{contract.contractId?.slice(0, 8)}...</span></p>
          </div>

          <div>
            <SectionTitle number="I" title="Thông tin bên thuê" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 pl-10">
              {[
                ['Họ và tên',     profile?.fullName || '—'],
                ['Số CCCD/CMND',  profile?.cccd    || '—'],
                ['Số điện thoại', profile?.phone   || '—'],
                ['Email',         contract.userEmail],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2 items-center">
                  <span className="text-sm text-slate-500 min-w-32">{label}:</span>
                  <span className="text-sm font-semibold text-slate-800">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle number="II" title="Đối tượng hợp đồng" />
            <div className="pl-10 space-y-3">
              <div className="flex gap-2">
                <span className="text-sm text-slate-500 min-w-32">Ký túc xá:</span>
                <span className="text-sm font-semibold text-slate-800">{contract.dormName || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm text-slate-500 min-w-32">Phòng:</span>
                <span className="text-sm font-semibold text-slate-800">{contract.roomName || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm text-slate-500 min-w-32">Tầng:</span>
                <span className="text-sm font-semibold text-slate-800">
                  {contract.floor != null ? `Tầng ${contract.floor}` : '—'}
                </span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-sm text-slate-500 min-w-32">Giường thuê:</span>
                <div className="flex flex-wrap gap-1.5">
                  {beds.length > 0
                    ? beds.map(b => (
                        <span key={b} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">{b}</span>
                      ))
                    : <span className="text-sm text-slate-400">—</span>
                  }
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionTitle number="III" title="Thời hạn & thanh toán" />
            <div className="pl-10 grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex gap-2 items-center">
                <span className="text-sm text-slate-500 min-w-32">Ngày bắt đầu:</span>
                <span className="text-sm font-semibold text-slate-800">{fmtDate(contract.startDate)}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-slate-500 min-w-32">Thời hạn:</span>
                <span className="text-sm font-semibold text-slate-800">{contract.stayDuration} tháng</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm text-slate-500 min-w-32">Ngày kết thúc:</span>
                <span className="text-sm font-semibold text-slate-800">{fmtDate(endDate)}</span>
              </div>
            </div>
          </div>

          <div>
            <SectionTitle number="IV" title="Tài chính" />
            <div className="pl-10 space-y-2">
              <div className="flex items-center justify-between py-2.5 border-b border-dashed border-slate-200">
                <div>
                  <span className="text-sm text-slate-600">Giá thuê cơ bản</span>
                  <span className="text-xs text-slate-400 ml-2">({bedCount} giường × {fmtMoney(BASE_RENT_PER_BED)})</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{fmtMoney(totalRent)}/tháng</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-dashed border-slate-200">
                <span className="text-sm text-slate-600">Tiền đặt cọc</span>
                <span className="text-sm font-bold text-slate-800">
                  {contract.depositAmount ? fmtMoney(contract.depositAmount) : fmtMoney(totalRent * 2)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-slate-600">Phí dịch vụ</span>
                <span className="text-sm font-medium text-slate-500">Tính thêm theo thực tế</span>
              </div>
            </div>
          </div>

          {contract.signatureUrl && (
            <div className="border-t border-slate-100 pt-4">
              <a
                href={contract.signatureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline"
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                Xem tài liệu đính kèm
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Điều khoản ── */}
      {tab === 'terms' && (
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-8">
          <div>
            <SectionTitle number="I" title="Các khoản phí dịch vụ" />
            <div className="pl-10 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-4 py-3">Dịch vụ</th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-4 py-3">Đơn giá</th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-4 py-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SERVICE_FEES.map(fee => (
                    <tr key={fee.name}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{fee.name}</td>
                      <td className="px-4 py-3 font-bold text-blue-700">{fee.price}</td>
                      <td className="px-4 py-3 text-slate-500">{fee.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <SectionTitle number="II" title="Quy định hoàn & khấu trừ tiền cọc" />
            <div className="pl-10 space-y-3">
              {DEPOSIT_RULES.map(rule => (
                <div key={rule.title} className={`flex gap-3 p-4 rounded-xl border ${rule.bg}`}>
                  <span className={`material-symbols-outlined text-xl mt-0.5 flex-shrink-0 ${rule.color}`}>{rule.icon}</span>
                  <div>
                    <p className={`text-sm font-bold mb-1 ${rule.color}`}>{rule.title}</p>
                    <p className="text-sm text-slate-600">{rule.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle number="III" title="Nội quy ký túc xá" />
            <div className="pl-10 grid grid-cols-1 gap-2">
              {HOUSE_RULES.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
                  <span className="material-symbols-outlined text-blue-500 text-base mt-0.5 flex-shrink-0">{rule.icon}</span>
                  <span className="text-sm text-slate-700">{rule.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle number="IV" title="Điều khoản xử lý vi phạm" />
            <div className="pl-10 space-y-3">
              {VIOLATION_TERMS.map(v => (
                <div key={v.level} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${v.badge} flex-shrink-0 mt-0.5`}>{v.level}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800 mb-1">{v.action}</p>
                    <p className="text-sm text-slate-500">{v.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle number="V" title="Điều khoản chung" />
            <div className="pl-10 space-y-2 text-sm text-slate-600">
              <p>• Hợp đồng có hiệu lực kể từ ngày ký và được lập thành 02 bản, mỗi bên giữ 01 bản.</p>
              <p>• Mọi tranh chấp phát sinh được giải quyết trên tinh thần thương lượng hoà giải.</p>
              <p>• Bên thuê không được tự ý chuyển nhượng, cho thuê lại hoặc cho mượn phòng dưới bất kỳ hình thức nào.</p>
              <p>• Mọi thay đổi, bổ sung nội dung hợp đồng phải được lập thành văn bản và có chữ ký của cả hai bên.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Biên bản bàn giao ── */}
      {tab === 'handover' && (
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-8">
          {handoverLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
            </div>
          ) : (
            <>
              {(['IN', 'OUT'] as const).map(type => {
                const list = handovers.filter(h => h.type === type);
                const sectionLabel = type === 'IN' ? 'Biên bản nhận phòng' : 'Biên bản trả phòng';
                const icon       = type === 'IN' ? 'login'  : 'logout';
                const headerBg   = type === 'IN' ? 'bg-emerald-600' : 'bg-orange-500';
                return (
                  <div key={type}>
                    {/* Section heading */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex items-center gap-2 px-3 py-1.5 ${headerBg} text-white rounded-lg text-sm font-bold`}>
                        <span className="material-symbols-outlined text-base">{icon}</span>
                        {sectionLabel}
                      </div>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {list.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 gap-2">
                        <span className="material-symbols-outlined text-3xl">assignment</span>
                        <p className="text-sm">Chưa có {sectionLabel.toLowerCase()}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {list.map(h => (
                          <div key={h.id} className="border border-slate-200 rounded-xl overflow-hidden">
                            {/* Record header */}
                            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
                              <span className="text-sm font-mono text-slate-500">{h.id.slice(0, 8)}...</span>
                              <span className="text-xs text-slate-400">{fmtDate(h.createdAt)}</span>
                            </div>

                            {/* Note */}
                            {h.note && (
                              <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 text-sm text-amber-800">
                                <span className="font-semibold">Ghi chú: </span>{h.note}
                              </div>
                            )}

                            {/* Bed table */}
                            {h.beds.length > 0 && (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-slate-100 bg-white">
                                      <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-3">Giường</th>
                                      <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-4 py-3">Khung giường</th>
                                      <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-4 py-3">Nệm</th>
                                      <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-4 py-3">Tủ</th>
                                      <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-4 py-3">Chìa khoá</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {h.beds.map(bed => (
                                      <tr key={bed.bedId}>
                                        <td className="px-5 py-3 font-semibold text-slate-800">{bed.bedNumber}</td>
                                        {[bed.bedStatus, bed.mattressStatus, bed.cabinetStatus, bed.keyStatus].map((s, i) => (
                                          <td key={i} className={`px-4 py-3 font-medium ${EQUIPMENT_STATUS_STYLE[s] ?? 'text-slate-600'}`}>
                                            {s}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const UserContractPage = () => {
  const [contracts, setContracts] = useState<ContractDTO[]>([]);
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContractDTO | null>(null);
  const [handovers, setHandovers] = useState<HandoverReport[]>([]);
  const [handoverLoading, setHandoverLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      ContractService.getMyContracts(),
      ApiClient.get<UserProfileDTO>('/users/profile'),
    ])
      .then(([data, profileData]) => {
        setContracts(data);
        setProfile(profileData);
        if (data.length > 0) selectContract(data[0]);
      })
      .catch(err => setError(err.message || 'Không thể tải dữ liệu hợp đồng'))
      .finally(() => setLoading(false));
  }, []);

  const selectContract = (c: ContractDTO) => {
    setSelected(c);
    setHandovers([]);
    setHandoverLoading(true);
    HandoverService.getByContractId(c.contractId)
      .then(setHandovers)
      .catch(() => setHandovers([]))
      .finally(() => setHandoverLoading(false));
  };

  if (loading) return <div className="text-center p-24 text-slate-500 font-medium">Đang tải hợp đồng...</div>;
  if (error)   return <div className="text-center p-24 text-red-500 font-bold">{error}</div>;

  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <span className="material-symbols-outlined text-6xl text-slate-300">description</span>
        <p className="text-slate-500 text-base">Bạn chưa có hợp đồng nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <span className="material-symbols-outlined text-blue-700">description</span>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hợp đồng của tôi</h1>
          <p className="text-slate-500 text-sm">{contracts.length} hợp đồng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Contract list */}
        <div className="flex flex-col gap-3">
          {contracts.map(c => {
            const uiStatus = toUIStatus(c.status);
            const isActive = selected?.contractId === c.contractId;
            return (
              <button
                key={c.contractId}
                onClick={() => selectContract(c)}
                className={`text-left rounded-xl border p-4 transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-slate-400 truncate">{c.contractId?.slice(0, 8)}…</span>
                  <span className={`inline-flex items-center gap-1 text-[0.65rem] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[uiStatus]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[uiStatus]}`} />
                    {uiStatus}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{c.dormName ?? '—'}</p>
                <p className="text-xs text-slate-500">{c.roomName}{c.bedNumbers ? ` · Giường ${c.bedNumbers}` : ''}</p>
                <p className="text-xs text-slate-400 mt-1">{fmtDate(c.startDate)}</p>
              </button>
            );
          })}
        </div>

        {/* Contract detail */}
        <div className="lg:col-span-2">
          {selected && (
            <ContractDetail
              contract={selected}
              profile={profile}
              handovers={handovers}
              handoverLoading={handoverLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};
