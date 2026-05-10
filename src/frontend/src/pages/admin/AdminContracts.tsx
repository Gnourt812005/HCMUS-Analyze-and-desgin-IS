import { useState, useEffect, useMemo } from 'react';
import {
  ContractService,
  ContractAdminDTO,
  RentalFormOptionDTO,
  DormFeesDTO,
} from '../../api/ContractService';
import { ApiClient } from '../../api/ApiClient';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPOSIT_RULES = [
  { icon: 'check_circle',  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', title: 'Hoàn trả 100% tiền cọc',               detail: 'Áp dụng khi trả phòng đúng hạn theo hợp đồng, không có hư hỏng tài sản và đã thanh toán đầy đủ các khoản phí.' },
  { icon: 'check_circle',  color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',       title: 'Hoàn trả 80% tiền cọc',               detail: 'Dành cho trường hợp đã đặt cọc nhưng chưa ký hợp đồng, do không đạt điều kiện lưu trú hoặc chủ động hủy giao dịch.' },
  { icon: 'check_circle',  color: 'text-yellow-600',  bg: 'bg-yellow-50 border-yellow-200',   title: 'Hoàn trả 70% tiền cọc',               detail: 'Dành cho khách đã ký hợp đồng, lưu trú trên 6 tháng nhưng trả phòng trước khi hết hạn hợp đồng.' },
  { icon: 'check_circle',  color: 'text-orange-600',  bg: 'bg-orange-50 border-orange-200',   title: 'Hoàn trả 50% tiền cọc',               detail: 'Dành cho khách đã ký hợp đồng, lưu trú chưa tới 6 tháng nhưng trả phòng trước hạn.' },
  { icon: 'remove_circle', color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',     title: 'Khấu trừ chi phí sửa chữa và công nợ', detail: 'Hư hỏng tài sản ghi nhận trong biên bản bàn giao sẽ được khấu trừ vào tiền cọc. Các khoản nợ tiền thuê, điện nước và dịch vụ cũng được đối soát và khấu trừ tại bước này.' },
  { icon: 'cancel',        color: 'text-red-600',     bg: 'bg-red-50 border-red-200',         title: 'Không hoàn trả tiền cọc (0%)',         detail: 'Vi phạm hợp đồng nghiêm trọng hoặc tự ý rời đi không báo trước. Nếu tiền cọc không đủ bù các khoản nợ, khách hàng bắt buộc thanh toán thêm phần chênh lệch.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n: number) { return n.toLocaleString('vi-VN') + ' đ'; }

function feesToItems(fees: DormFeesDTO) {
  const fmt = (n: number, unit: string) => n > 0 ? `${fmtMoney(n)}${unit}` : 'Miễn phí';
  return [
    { name: 'Điện',           price: fmt(fees.electricityFee, '/kWh'),          note: 'Theo chỉ số công tơ, thanh toán cuối tháng' },
    { name: 'Nước',           price: fmt(fees.waterFee,       '/người/tháng'),   note: 'Định mức 4m³/người, vượt tính thêm' },
    { name: 'Internet & Wifi',price: fmt(fees.wifiFee,        '/phòng/tháng'),   note: 'Tốc độ tối thiểu 50 Mbps' },
    { name: 'Vệ sinh chung',  price: fmt(fees.cleaningFee,    '/người/tháng'),   note: 'Bao gồm hành lang và khu vực sinh hoạt chung' },
  ];
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('vi-VN'); } catch { return iso; }
}
function calcEndDate(startDate: string, stayDuration: number): string {
  try {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + stayDuration);
    return d.toISOString().split('T')[0];
  } catch { return ''; }
}

type UIStatus = 'Hiệu lực' | 'Đã chấm dứt' | 'Đã thanh lý';
function toUIStatus(s: string): UIStatus {
  if (s === 'ACTIVE') return 'Hiệu lực';
  if (s === 'TERMINATED') return 'Đã chấm dứt';
  return 'Đã thanh lý';
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

// ─── Create Contract Modal ────────────────────────────────────────────────────

const CreateContractModal = ({
  onClose, onCreated,
}: { onClose: () => void; onCreated: () => void }) => {
  const [forms, setForms] = useState<RentalFormOptionDTO[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [rentalFormId, setRentalFormId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [stayDuration, setStayDuration] = useState(6);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ContractService.getRentalForms()
      .then(setForms)
      .catch(() => setForms([]))
      .finally(() => setLoadingForms(false));
  }, []);

  const selected = forms.find(f => f.id === rentalFormId);

  const validate = () => {
    const e: Record<string, string> = {};
    const today = new Date().toISOString().split('T')[0];
    if (!rentalFormId) e.form = 'Vui lòng chọn phiếu đăng ký thuê';
    if (!startDate) e.start = 'Vui lòng chọn ngày bắt đầu';
    else if (startDate < today) e.start = 'Ngày bắt đầu không được nhỏ hơn ngày hiện tại';
    if (stayDuration < 1) e.duration = 'Thời hạn tối thiểu 1 tháng';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await ContractService.create({ rentalFormId, startDate, stayDuration });
      onCreated();
    } catch (err: any) {
      setErrors({ api: err.message || 'Lỗi khi tạo hợp đồng' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Lập hợp đồng mới</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">

          {/* Phiếu đăng ký thuê */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Phiếu đăng ký thuê <span className="text-red-500">*</span>
            </label>
            {loadingForms ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-3">
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                Đang tải...
              </div>
            ) : forms.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-2">Không có phiếu đăng ký nào chưa có hợp đồng.</p>
            ) : (
              <select
                value={rentalFormId}
                onChange={e => { setRentalFormId(e.target.value); setErrors({}); }}
                className="w-full bg-slate-50 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">-- Chọn phiếu đăng ký thuê --</option>
                {forms.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.id.slice(0, 8)}... — {f.customerName} {f.roomName ? `(Phòng ${f.roomName})` : ''}
                  </option>
                ))}
              </select>
            )}
            {errors.form && <p className="text-red-500 text-xs mt-1">{errors.form}</p>}
          </div>

          {/* Thông tin tự điền */}
          {selected && (
            <div className="bg-blue-50 rounded-xl p-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Khách hàng</p>
                <p className="font-bold text-slate-800">{selected.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Số điện thoại</p>
                <p className="font-bold text-slate-800">{selected.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">CCCD</p>
                <p className="font-bold text-slate-800">{selected.cccd || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Phòng</p>
                <p className="font-bold text-slate-800">{selected.roomName || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Giường thuê</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {selected.bedNumbers.length > 0
                    ? selected.bedNumbers.map(b => (
                      <span key={b} className="px-2 py-0.5 bg-white border border-blue-200 rounded-full text-xs font-bold text-blue-700">{b}</span>
                    ))
                    : <span className="text-xs text-slate-400">—</span>
                  }
                </div>
              </div>
              <div className="col-span-3 pt-1 border-t border-blue-200">
                <p className="text-xs text-blue-600 font-semibold">
                  Tiền thuê:{' '}
                  <span className="font-bold text-slate-800">{fmtMoney(selected.monthlyRent)}/tháng</span>
                </p>
              </div>
            </div>
          )}

          {/* Ngày bắt đầu & thời hạn */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {errors.start && <p className="text-red-500 text-xs mt-1">{errors.start}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Thời hạn thuê (tháng) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={stayDuration || ''}
                onChange={e => setStayDuration(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {startDate && stayDuration >= 1 && (
                <p className="text-xs text-slate-400 mt-1">
                  Kết thúc: <span className="font-medium text-slate-600">{fmtDate(calcEndDate(startDate, stayDuration))}</span>
                </p>
              )}
              {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
            </div>
          </div>

          {errors.api && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              <span className="material-symbols-outlined text-base">error</span>
              {errors.api}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-all">Huỷ</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-all active:scale-95"
          >
            {saving
              ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              : <span className="material-symbols-outlined text-base">save</span>
            }
            {saving ? 'Đang lưu...' : 'Lưu hợp đồng'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Contract Detail Modal ────────────────────────────────────────────────────

type DetailTab = 'info' | 'terms';

const SectionTitle = ({ number, title }: { number: string; title: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">{number}</span>
    <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">{title}</h3>
    <div className="flex-1 h-px bg-slate-200" />
  </div>
);

const ContractDetailModal = ({
  contract, onClose, onUpdated, onCancelled,
}: {
  contract: ContractAdminDTO;
  onClose: () => void;
  onUpdated: () => void;
  onCancelled: () => void;
}) => {
  const [tab, setTab] = useState<DetailTab>('info');
  const [editing, setEditing] = useState(false);
  const [startDate, setStartDate] = useState(String(contract.startDate).split('T')[0]);
  const [stayDuration, setStayDuration] = useState(contract.stayDuration);
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [actionError, setActionError] = useState('');
  const [policyContent, setPolicyContent] = useState<string>('');
  const [dormFees, setDormFees] = useState<DormFeesDTO | null>(null);

  useEffect(() => {
    ApiClient.get<{ data: { content: string } }>('/admin/rentals/policy/latest')
      .then(res => setPolicyContent(res.data?.content ?? ''))
      .catch(() => setPolicyContent(''));
    ContractService.getFees(contract.id)
      .then(fees => setDormFees(fees));
  }, [contract.id]);

  const uiStatus = toUIStatus(contract.status);
  const totalRent = contract.monthlyRent;
  const endDate = calcEndDate(startDate, stayDuration);

  const handleSave = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (startDate < today) {
      setActionError('Ngày bắt đầu không được nhỏ hơn ngày hiện tại');
      return;
    }
    setSaving(true);
    setActionError('');
    try {
      await ContractService.update(contract.id, { startDate, stayDuration });
      onUpdated();
      setEditing(false);
    } catch (err: any) {
      setActionError(err.message || 'Lỗi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setSaving(true);
    setActionError('');
    try {
      await ContractService.cancel(contract.id);
      onCancelled();
      onClose();
    } catch (err: any) {
      setActionError(err.message || 'Lỗi huỷ hợp đồng');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[92vh] flex flex-col">

        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-slate-900 font-mono">{contract.contractCode || contract.id.slice(0, 8) + '...'}</h2>
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[uiStatus]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[uiStatus]}`} />
                  {uiStatus}
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                Lập ngày {fmtDate(contract.createdAt)}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors mt-1">
              <span className="material-symbols-outlined text-slate-500">close</span>
            </button>
          </div>
          <div className="flex gap-1 mt-4 bg-slate-100 p-1 rounded-lg w-fit">
            {([['info', 'Thông tin hợp đồng'], ['terms', 'Điều khoản & Nội quy']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${tab === key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Thông tin */}
        {tab === 'info' && (
          <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
            <div className="text-center py-4 border border-slate-200 rounded-xl bg-slate-50">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Cộng hoà Xã hội Chủ nghĩa Việt Nam</p>
              <p className="text-xs text-slate-400 mb-3">Độc lập – Tự do – Hạnh phúc</p>
              <p className="text-lg font-black uppercase tracking-wide text-slate-800">Hợp đồng Thuê Phòng Ký túc xá</p>
              <p className="text-sm text-slate-500 mt-1">Số: <span className="font-bold text-slate-700 font-mono">{contract.contractCode || contract.id.slice(0, 8) + '...'}</span></p>
            </div>

            <div>
              <SectionTitle number="I" title="Thông tin bên thuê" />
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 pl-10">
                {[
                  ['Họ và tên', contract.customerName],
                  ['Số CCCD/CMND', contract.cccd || '—'],
                  ['Số điện thoại', contract.phone || '—'],
                  ['Email', contract.userEmail],
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
                  <span className="text-sm text-slate-500 min-w-32">Phòng:</span>
                  <span className="text-sm font-semibold text-slate-800">{contract.roomName || '—'}</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-sm text-slate-500 min-w-32">Giường thuê:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {contract.bedNumbers.length > 0
                      ? contract.bedNumbers.map(b => (
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
                  {editing
                    ? <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    : <span className="text-sm font-semibold text-slate-800">{fmtDate(startDate)}</span>
                  }
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-slate-500 min-w-32">Thời hạn:</span>
                  {editing
                    ? <input type="number" min={1} max={24} value={stayDuration || ''} onChange={e => setStayDuration(parseInt(e.target.value) || 0)}
                      className="bg-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-24" />
                    : <span className="text-sm font-semibold text-slate-800">{stayDuration} tháng</span>
                  }
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
                  <span className="text-sm text-slate-600">Giá thuê</span>
                  <span className="text-sm font-bold text-slate-800">{fmtMoney(totalRent)}/tháng</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-600">Phí dịch vụ</span>
                  <span className="text-sm font-medium text-slate-500">Tính thêm theo thực tế</span>
                </div>
              </div>
            </div>

            {actionError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                <span className="material-symbols-outlined text-base">error</span>
                {actionError}
              </div>
            )}

            {confirmCancel && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-3">
                  Xác nhận huỷ hợp đồng này? Thao tác này không thể hoàn tác.
                </p>
                <div className="flex gap-2">
                  <button onClick={handleCancel} disabled={saving}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-all">
                    Xác nhận huỷ
                  </button>
                  <button onClick={() => setConfirmCancel(false)}
                    className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all">
                    Quay lại
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Điều khoản */}
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
                    {dormFees
                      ? feesToItems(dormFees).map(fee => (
                        <tr key={fee.name}>
                          <td className="px-4 py-3 font-semibold text-slate-800">{fee.name}</td>
                          <td className="px-4 py-3 font-bold text-blue-700">{fee.price}</td>
                          <td className="px-4 py-3 text-slate-500">{fee.note}</td>
                        </tr>
                      ))
                      : (
                        <tr>
                          <td colSpan={3} className="px-4 py-4 text-center text-sm text-slate-400 italic">Đang tải phí dịch vụ...</td>
                        </tr>
                      )
                    }
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
              <div className="pl-10">
                {policyContent ? (
                  <div>
                    {policyContent
                      .split('\n')
                      .map(line => line.replace(/^[•\-]\s*/, '').trim())
                      .filter(Boolean)
                      .map((line, i) => (
                        <div key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-700">{line}</span>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Chưa có nội quy được cấu hình.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          {tab === 'info' && uiStatus === 'Hiệu lực' && !confirmCancel ? (
            <button onClick={() => setConfirmCancel(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-all">
              <span className="material-symbols-outlined text-base">cancel</span>
              Huỷ hợp đồng
            </button>
          ) : <div />}

          <div className="flex gap-2">
            {tab === 'info' && uiStatus === 'Hiệu lực' && !editing && !confirmCancel && (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-all">
                <span className="material-symbols-outlined text-base">edit</span>
                Chỉnh sửa
              </button>
            )}
            {editing && (
              <>
                <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-all">Huỷ</button>
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-all">
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </>
            )}
            {!editing && !confirmCancel && (
              <button onClick={onClose} className="px-5 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all">
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | UIStatus;

export const AdminContracts = () => {
  const [contracts, setContracts] = useState<ContractAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<ContractAdminDTO | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchContracts = () => {
    setLoading(true);
    setLoadError('');
    ContractService.getAll()
      .then(setContracts)
      .catch(err => setLoadError(err.message || 'Không thể tải danh sách hợp đồng'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchContracts(); }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreated = () => {
    setShowCreate(false);
    showSuccess('Đã lập hợp đồng thành công!');
    fetchContracts();
  };

  const handleUpdated = () => {
    showSuccess('Đã cập nhật hợp đồng!');
    fetchContracts();
  };

  const handleCancelled = () => {
    showSuccess('Đã huỷ hợp đồng.');
    fetchContracts();
    setSelected(null);
  };

  const filtered = useMemo(() => contracts.filter(c => {
    const kw = keyword.toLowerCase();
    const uiStatus = toUIStatus(c.status);
    const matchKw = !keyword
      || c.id.toLowerCase().includes(kw)
      || c.customerName.toLowerCase().includes(kw)
      || (c.roomName || '').toLowerCase().includes(kw)
      || (c.phone || '').includes(kw)
      || (c.cccd || '').includes(kw)
      || (c.contractCode || '').toLowerCase().includes(kw);
    const matchStatus = statusFilter === 'all' || uiStatus === statusFilter;
    return matchKw && matchStatus;
  }), [contracts, keyword, statusFilter]);

  const stats = useMemo(() => ({
    total: contracts.length,
    active: contracts.filter(c => toUIStatus(c.status) === 'Hiệu lực').length,
    terminated: contracts.filter(c => toUIStatus(c.status) === 'Đã chấm dứt').length,
    liquidated: contracts.filter(c => toUIStatus(c.status) === 'Đã thanh lý').length,
  }), [contracts]);

  return (
    <div className="space-y-6 pb-10">

      {successMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quản lý Hợp đồng</h1>
          <p className="text-slate-500 text-sm mt-1">Lập và theo dõi hợp đồng thuê phòng</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-blue-200"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Lập hợp đồng mới
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng hợp đồng', value: stats.total, icon: 'description', color: 'text-blue-600 bg-blue-50' },
          { label: 'Đang hiệu lực', value: stats.active, icon: 'verified', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Đã chấm dứt', value: stats.terminated, icon: 'cancel', color: 'text-slate-500 bg-slate-100' },
          { label: 'Đã thanh lý', value: stats.liquidated, icon: 'receipt_long', color: 'text-blue-600 bg-blue-50' },
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
            placeholder="Tìm theo mã hợp đồng, tên khách hàng, phòng, SĐT, CCCD..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'Hiệu lực', 'Đã chấm dứt', 'Đã thanh lý'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {s === 'all' ? 'Tất cả' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
            <p className="text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400 gap-3">
            <span className="material-symbols-outlined text-4xl">error</span>
            <p className="text-sm">{loadError}</p>
            <button onClick={fetchContracts} className="text-xs text-blue-600 hover:underline">Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3">folder_open</span>
            <p className="font-medium">Không tìm thấy hợp đồng phù hợp</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Mã HĐ</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Khách hàng</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Phòng / Giường</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Tiền thuê</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Thời hạn</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => {
                const uiStatus = toUIStatus(c.status);
                const endDate = calcEndDate(c.startDate, c.stayDuration);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="px-5 py-4 font-bold text-blue-700 font-mono text-xs">{c.contractCode || c.id.slice(0, 8) + '...'}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{c.customerName}</p>
                      <p className="text-xs text-slate-400">{c.phone || c.cccd || c.userEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700">{c.roomName || '—'}</p>
                      <p className="text-xs text-slate-400">{c.bedNumbers.join(', ') || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{fmtMoney(c.monthlyRent)}</p>
                      <p className="text-xs text-slate-400">{c.stayDuration} tháng</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-700">{fmtDate(c.startDate)}</p>
                      <p className="text-xs text-slate-400">→ {fmtDate(endDate)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[uiStatus]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[uiStatus]}`} />
                        {uiStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700">
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && !loadError && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            Hiển thị {filtered.length} / {contracts.length} hợp đồng
          </div>
        )}
      </div>

      {showCreate && <CreateContractModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {selected && (
        <ContractDetailModal
          contract={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
          onCancelled={handleCancelled}
        />
      )}
    </div>
  );
};
