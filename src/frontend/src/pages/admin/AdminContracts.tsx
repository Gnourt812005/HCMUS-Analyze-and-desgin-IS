import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ContractStatus = 'Hiệu lực' | 'Hết hạn' | 'Đã huỷ';
type PaymentPeriod = 'monthly' | 'quarterly' | 'yearly';

interface DepositForm {
  id: string;
  customerName: string;
  phone: string;
  cccd: string;
  room: string;
  beds: string[];
}

interface Contract {
  id: string;
  depositFormId: string;
  customerName: string;
  phone: string;
  cccd: string;
  room: string;
  beds: string[];
  startDate: string;
  endDate: string;
  paymentPeriod: PaymentPeriod;
  status: ContractStatus;
  createdDate: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DEPOSIT_FORMS: DepositForm[] = [
  { id: 'DC001', customerName: 'Nguyễn Văn An', phone: '0901234567', cccd: '079201012345', room: 'A101', beds: ['A101-1', 'A101-2'] },
  { id: 'DC002', customerName: 'Trần Thị Bình', phone: '0912345678', cccd: '079202023456', room: 'B203', beds: ['B203-1'] },
  { id: 'DC003', customerName: 'Lê Hoàng Cường', phone: '0923456789', cccd: '079203034567', room: 'C301', beds: ['C301-1', 'C301-2', 'C301-3'] },
];

const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'HD001', depositFormId: 'DC001',
    customerName: 'Nguyễn Văn An', phone: '0901234567', cccd: '079201012345',
    room: 'A101', beds: ['A101-1', 'A101-2'],
    startDate: '2025-01-01', endDate: '2025-12-31',
    paymentPeriod: 'monthly', status: 'Hiệu lực', createdDate: '2024-12-28',
  },
  {
    id: 'HD002', depositFormId: 'DC002',
    customerName: 'Trần Thị Bình', phone: '0912345678', cccd: '079202023456',
    room: 'B203', beds: ['B203-1'],
    startDate: '2024-06-01', endDate: '2024-12-31',
    paymentPeriod: 'quarterly', status: 'Hết hạn', createdDate: '2024-05-25',
  },
  {
    id: 'HD003', depositFormId: 'DC003',
    customerName: 'Lê Hoàng Cường', phone: '0923456789', cccd: '079203034567',
    room: 'C301', beds: ['C301-1', 'C301-2'],
    startDate: '2025-03-01', endDate: '2026-02-28',
    paymentPeriod: 'yearly', status: 'Hiệu lực', createdDate: '2025-02-20',
  },
  {
    id: 'HD004', depositFormId: 'DC001',
    customerName: 'Phạm Thị Dung', phone: '0934567890', cccd: '079204045678',
    room: 'D102', beds: ['D102-1'],
    startDate: '2024-09-01', endDate: '2025-01-31',
    paymentPeriod: 'monthly', status: 'Đã huỷ', createdDate: '2024-08-28',
  },
];

const PAYMENT_PERIOD_LABEL: Record<PaymentPeriod, string> = {
  monthly: 'Hàng tháng',
  quarterly: 'Hàng quý',
  yearly: 'Hàng năm',
};

const STATUS_STYLE: Record<ContractStatus, string> = {
  'Hiệu lực': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Hết hạn': 'bg-slate-100 text-slate-500 border-slate-200',
  'Đã huỷ': 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_DOT: Record<ContractStatus, string> = {
  'Hiệu lực': 'bg-emerald-500',
  'Hết hạn': 'bg-slate-400',
  'Đã huỷ': 'bg-red-500',
};

// ─── Create Contract Modal ────────────────────────────────────────────────────

const CreateContractModal = ({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (c: Contract) => void;
}) => {
  const [depositFormId, setDepositFormId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentPeriod, setPaymentPeriod] = useState<PaymentPeriod>('monthly');
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selected = MOCK_DEPOSIT_FORMS.find(d => d.id === depositFormId);

  const toggleBed = (bed: string) => {
    setSelectedBeds(prev =>
      prev.includes(bed) ? prev.filter(b => b !== bed) : [...prev, bed]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!depositFormId) e.deposit = 'Vui lòng chọn phiếu đặt cọc';
    if (!startDate) e.startDate = 'Vui lòng chọn ngày bắt đầu';
    if (!endDate) e.endDate = 'Vui lòng chọn ngày kết thúc';
    if (startDate && endDate && endDate <= startDate) e.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    if (selectedBeds.length === 0) e.beds = 'Vui lòng chọn ít nhất 1 giường';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate() || !selected) return;
    const contract: Contract = {
      id: `HD${String(Date.now()).slice(-3)}`,
      depositFormId,
      customerName: selected.customerName,
      phone: selected.phone,
      cccd: selected.cccd,
      room: selected.room,
      beds: selectedBeds,
      startDate,
      endDate,
      paymentPeriod,
      status: 'Hiệu lực',
      createdDate: new Date().toISOString().split('T')[0],
    };
    onCreate(contract);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Lập hợp đồng mới</h2>
            <p className="text-slate-500 text-sm mt-0.5">Tạo hợp đồng từ phiếu đặt cọc đã có</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">

          {/* Phiếu đặt cọc */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Phiếu đặt cọc <span className="text-red-500">*</span>
            </label>
            <select
              value={depositFormId}
              onChange={e => { setDepositFormId(e.target.value); setSelectedBeds([]); setErrors({}); }}
              className="w-full bg-slate-50 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">-- Chọn phiếu đặt cọc --</option>
              {MOCK_DEPOSIT_FORMS.map(d => (
                <option key={d.id} value={d.id}>{d.id} — {d.customerName} (Phòng {d.room})</option>
              ))}
            </select>
            {errors.deposit && <p className="text-red-500 text-xs mt-1">{errors.deposit}</p>}
          </div>

          {/* Thông tin khách hàng (auto-fill) */}
          {selected && (
            <div className="bg-blue-50 rounded-xl p-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Khách hàng</p>
                <p className="font-bold text-slate-800">{selected.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Số điện thoại</p>
                <p className="font-bold text-slate-800">{selected.phone}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">CCCD</p>
                <p className="font-bold text-slate-800">{selected.cccd}</p>
              </div>
              <div className="col-span-3">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Phòng</p>
                <p className="font-bold text-slate-800">Phòng {selected.room}</p>
              </div>
            </div>
          )}

          {/* Chọn giường */}
          {selected && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Giường thuê <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {selected.beds.map(bed => (
                  <button
                    key={bed}
                    type="button"
                    onClick={() => toggleBed(bed)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      selectedBeds.includes(bed)
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {selectedBeds.includes(bed) ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    {bed}
                  </button>
                ))}
              </div>
              {errors.beds && <p className="text-red-500 text-xs mt-1">{errors.beds}</p>}
            </div>
          )}

          {/* Ngày hiệu lực */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-50 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-slate-50 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Kỳ thanh toán */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Kỳ thanh toán</label>
            <div className="flex gap-3">
              {(['monthly', 'quarterly', 'yearly'] as PaymentPeriod[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPaymentPeriod(p)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    paymentPeriod === p
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'
                  }`}
                >
                  {PAYMENT_PERIOD_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-all">
            Huỷ
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">save</span>
            Lưu hợp đồng
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Contract Detail Modal ────────────────────────────────────────────────────

const ContractDetailModal = ({
  contract,
  onClose,
  onUpdate,
  onCancel,
}: {
  contract: Contract;
  onClose: () => void;
  onUpdate: (c: Contract) => void;
  onCancel: (id: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [startDate, setStartDate] = useState(contract.startDate);
  const [endDate, setEndDate] = useState(contract.endDate);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const handleSave = () => {
    onUpdate({ ...contract, startDate, endDate });
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        <div className="flex items-start justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900">Hợp đồng {contract.id}</h2>
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[contract.status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[contract.status]}`} />
                {contract.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm">Lập ngày {contract.createdDate}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors mt-1">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        <div className="px-7 py-6 space-y-5">
          {/* Thông tin khách hàng */}
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Khách hàng', contract.customerName],
              ['Số điện thoại', contract.phone],
              ['CCCD', contract.cccd],
              ['Phiếu đặt cọc', contract.depositFormId],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Phòng & giường */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Phòng / Giường</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
                Phòng {contract.room}
              </span>
              {contract.beds.map(b => (
                <span key={b} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{b}</span>
              ))}
            </div>
          </div>

          {/* Thời hạn */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Ngày bắt đầu</p>
              {editing ? (
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              ) : (
                <p className="text-sm font-semibold text-slate-800">{contract.startDate}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Ngày kết thúc</p>
              {editing ? (
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              ) : (
                <p className="text-sm font-semibold text-slate-800">{contract.endDate}</p>
              )}
            </div>
          </div>

          {/* Kỳ thanh toán */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Kỳ thanh toán</p>
            <p className="text-sm font-semibold text-slate-800">{PAYMENT_PERIOD_LABEL[contract.paymentPeriod]}</p>
          </div>

          {/* Xác nhận huỷ */}
          {confirmCancel && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-700 mb-3">Xác nhận huỷ hợp đồng {contract.id}? Thao tác này không thể hoàn tác.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { onCancel(contract.id); onClose(); }}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all"
                >
                  Xác nhận huỷ
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all"
                >
                  Quay lại
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100">
          {contract.status === 'Hiệu lực' && !confirmCancel && (
            <button
              onClick={() => setConfirmCancel(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-all"
            >
              <span className="material-symbols-outlined text-base">cancel</span>
              Huỷ hợp đồng
            </button>
          )}
          {!confirmCancel && <div className="flex-1" />}
          <div className="flex gap-2">
            {contract.status === 'Hiệu lực' && !editing && !confirmCancel && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Chỉnh sửa
              </button>
            )}
            {editing && (
              <>
                <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                  Huỷ
                </button>
                <button onClick={handleSave} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all">
                  Lưu
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

export const AdminContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const filtered = useMemo(() => contracts.filter(c => {
    const kw = keyword.toLowerCase();
    const matchKw = !keyword ||
      c.id.toLowerCase().includes(kw) ||
      c.customerName.toLowerCase().includes(kw) ||
      c.room.toLowerCase().includes(kw) ||
      c.phone.includes(kw);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchKw && matchStatus;
  }), [contracts, keyword, statusFilter]);

  const stats = useMemo(() => ({
    total: contracts.length,
    active: contracts.filter(c => c.status === 'Hiệu lực').length,
    expired: contracts.filter(c => c.status === 'Hết hạn').length,
    cancelled: contracts.filter(c => c.status === 'Đã huỷ').length,
  }), [contracts]);

  const handleCreate = (c: Contract) => {
    setContracts(prev => [c, ...prev]);
    setShowCreate(false);
    showSuccess(`Đã lập hợp đồng ${c.id} thành công!`);
  };

  const handleUpdate = (updated: Contract) => {
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelected(updated);
    showSuccess(`Đã cập nhật hợp đồng ${updated.id}!`);
  };

  const handleCancel = (id: string) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'Đã huỷ' } : c));
    showSuccess(`Đã huỷ hợp đồng ${id}.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Toast */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Header */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng hợp đồng', value: stats.total, icon: 'description', color: 'text-blue-600 bg-blue-50' },
          { label: 'Đang hiệu lực', value: stats.active, icon: 'verified', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Hết hạn', value: stats.expired, icon: 'schedule', color: 'text-slate-500 bg-slate-100' },
          { label: 'Đã huỷ', value: stats.cancelled, icon: 'cancel', color: 'text-red-500 bg-red-50' },
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

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Tìm theo mã hợp đồng, tên khách hàng, phòng, SĐT..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'Hiệu lực', 'Hết hạn', 'Đã huỷ'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'Tất cả' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
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
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Thời hạn</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Kỳ TT</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => setSelected(c)}
                >
                  <td className="px-5 py-4 font-bold text-blue-700">{c.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{c.customerName}</p>
                    <p className="text-xs text-slate-400">{c.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-700">Phòng {c.room}</p>
                    <p className="text-xs text-slate-400">{c.beds.join(', ')}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-slate-700">{c.startDate}</p>
                    <p className="text-xs text-slate-400">→ {c.endDate}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{PAYMENT_PERIOD_LABEL[c.paymentPeriod]}</td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[c.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status]}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700">
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            Hiển thị {filtered.length} / {contracts.length} hợp đồng
          </div>
        )}
      </div>

      {showCreate && <CreateContractModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {selected && (
        <ContractDetailModal
          contract={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};
