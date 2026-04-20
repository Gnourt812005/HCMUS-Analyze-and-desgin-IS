import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type EquipmentStatus = 'Tốt' | 'Hư hỏng' | 'Mất';

interface BedHandover {
  bedName: string;
  bedStatus: EquipmentStatus;
  mattressStatus: EquipmentStatus;
  cabinetStatus: EquipmentStatus;
  keyStatus: EquipmentStatus;
}

interface HandoverReport {
  id: string;
  contractId: string;
  customerName: string;
  room: string;
  beds: BedHandover[];
  note: string;
  createdDate: string;
  createdBy: string;
  type: 'check-in' | 'check-out';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CONTRACTS = [
  { id: 'HD001', customerName: 'Nguyễn Văn An', room: 'A101', beds: ['A101-1', 'A101-2'] },
  { id: 'HD002', customerName: 'Trần Thị Bình', room: 'B203', beds: ['B203-1'] },
  { id: 'HD003', customerName: 'Lê Hoàng Cường', room: 'C301', beds: ['C301-1', 'C301-2', 'C301-3'] },
];

const MOCK_REPORTS: HandoverReport[] = [
  {
    id: 'BB001', contractId: 'HD001', customerName: 'Nguyễn Văn An', room: 'A101',
    beds: [
      { bedName: 'A101-1', bedStatus: 'Tốt', mattressStatus: 'Tốt', cabinetStatus: 'Tốt', keyStatus: 'Tốt' },
      { bedName: 'A101-2', bedStatus: 'Tốt', mattressStatus: 'Hư hỏng', cabinetStatus: 'Tốt', keyStatus: 'Tốt' },
    ],
    note: 'Nệm giường A101-2 bị rách nhẹ.', createdDate: '2025-01-01', createdBy: 'Staff', type: 'check-in',
  },
  {
    id: 'BB002', contractId: 'HD002', customerName: 'Trần Thị Bình', room: 'B203',
    beds: [
      { bedName: 'B203-1', bedStatus: 'Tốt', mattressStatus: 'Tốt', cabinetStatus: 'Tốt', keyStatus: 'Tốt' },
    ],
    note: '', createdDate: '2025-02-01', createdBy: 'Staff', type: 'check-in',
  },
  {
    id: 'BB003', contractId: 'HD003', customerName: 'Lê Hoàng Cường', room: 'C301',
    beds: [
      { bedName: 'C301-1', bedStatus: 'Tốt', mattressStatus: 'Tốt', cabinetStatus: 'Tốt', keyStatus: 'Tốt' },
      { bedName: 'C301-2', bedStatus: 'Hư hỏng', mattressStatus: 'Tốt', cabinetStatus: 'Mất', keyStatus: 'Tốt' },
    ],
    note: 'Khung giường C301-2 bị gãy. Tủ C301-2 mất chìa khoá ngăn.', createdDate: '2025-03-01', createdBy: 'Staff', type: 'check-out',
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const EQUIPMENT_KEYS: { key: keyof BedHandover; label: string; icon: string }[] = [
  { key: 'bedStatus', label: 'Giường', icon: 'bed' },
  { key: 'mattressStatus', label: 'Nệm', icon: 'rectangle' },
  { key: 'cabinetStatus', label: 'Tủ', icon: 'door_open' },
  { key: 'keyStatus', label: 'Chìa khóa', icon: 'key' },
];

const STATUS_OPTIONS: EquipmentStatus[] = ['Tốt', 'Hư hỏng', 'Mất'];

const STATUS_STYLE: Record<EquipmentStatus, string> = {
  'Tốt': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Hư hỏng': 'bg-amber-50 text-amber-700 border-amber-200',
  'Mất': 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_DOT: Record<EquipmentStatus, string> = {
  'Tốt': 'bg-emerald-500',
  'Hư hỏng': 'bg-amber-500',
  'Mất': 'bg-red-500',
};

function isBedGood(bed: BedHandover) {
  return bed.bedStatus === 'Tốt' && bed.mattressStatus === 'Tốt'
    && bed.cabinetStatus === 'Tốt' && bed.keyStatus === 'Tốt';
}

function isReportGood(report: HandoverReport) {
  return report.beds.every(isBedGood);
}

// ─── Status Selector (per equipment item) ─────────────────────────────────────

const StatusSelector = ({
  value, onChange,
}: {
  value: EquipmentStatus; onChange: (v: EquipmentStatus) => void;
}) => (
  <div className="flex gap-1">
    {STATUS_OPTIONS.map(opt => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
          value === opt ? STATUS_STYLE[opt] + ' border' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

// ─── Bed Checklist (used in both Create and Detail) ───────────────────────────

const BedChecklist = ({
  bed,
  editable,
  onChange,
}: {
  bed: BedHandover;
  editable: boolean;
  onChange?: (updated: BedHandover) => void;
}) => {
  const good = isBedGood(bed);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Bed header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-500 text-base">bed</span>
          <span className="text-sm font-bold text-slate-800">{bed.bedName}</span>
        </div>
        {!editable && (
          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            good ? STATUS_STYLE['Tốt'] : STATUS_STYLE['Hư hỏng']
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${good ? STATUS_DOT['Tốt'] : STATUS_DOT['Hư hỏng']}`} />
            {good ? 'Tốt' : 'Có vấn đề'}
          </span>
        )}
      </div>

      {/* Equipment rows */}
      <div className="divide-y divide-slate-100">
        {EQUIPMENT_KEYS.map(eq => {
          const val = bed[eq.key] as EquipmentStatus;
          return (
            <div key={eq.key} className="flex items-center gap-3 px-4 py-3">
              <span className="material-symbols-outlined text-slate-400 text-base w-5">{eq.icon}</span>
              <span className="text-sm text-slate-700 font-medium w-24">{eq.label}</span>
              {editable ? (
                <div className="flex-1">
                  <StatusSelector
                    value={val}
                    onChange={v => onChange?.({ ...bed, [eq.key]: v })}
                  />
                </div>
              ) : (
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[val]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[val]}`} />
                  {val}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Create Report Modal ──────────────────────────────────────────────────────

const CreateReportModal = ({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (r: HandoverReport) => void;
}) => {
  const [contractId, setContractId] = useState('');
  const [reportType, setReportType] = useState<'check-in' | 'check-out'>('check-in');
  const [beds, setBeds] = useState<BedHandover[]>([]);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedContract = MOCK_CONTRACTS.find(c => c.id === contractId);

  const handleSelectContract = (id: string) => {
    const contract = MOCK_CONTRACTS.find(c => c.id === id);
    setContractId(id);
    setErrors({});
    if (contract) {
      setBeds(contract.beds.map(b => ({
        bedName: b,
        bedStatus: 'Tốt', mattressStatus: 'Tốt', cabinetStatus: 'Tốt', keyStatus: 'Tốt',
      })));
    } else {
      setBeds([]);
    }
  };

  const updateBed = (index: number, updated: BedHandover) => {
    setBeds(prev => prev.map((b, i) => i === index ? updated : b));
  };

  const hasDamage = beds.some(b => !isBedGood(b));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!contractId) e.contract = 'Vui lòng chọn hợp đồng';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate() || !selectedContract) return;
    const report: HandoverReport = {
      id: `BB${String(Date.now()).slice(-3)}`,
      contractId,
      customerName: selectedContract.customerName,
      room: selectedContract.room,
      beds,
      note,
      createdDate: new Date().toISOString().split('T')[0],
      createdBy: 'Staff',
      type: reportType,
    };
    onCreate(report);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Lập biên bản bàn giao</h2>
            <p className="text-slate-500 text-sm mt-0.5">Kiểm tra tình trạng từng giường trong phòng</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">

          {/* Loại biên bản */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Loại biên bản</label>
            <div className="flex gap-3">
              {([['check-in', 'login', 'Nhận phòng'], ['check-out', 'logout', 'Trả phòng']] as const).map(([val, icon, lbl]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setReportType(val)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${
                    reportType === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{icon}</span>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Hợp đồng */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Hợp đồng <span className="text-red-500">*</span>
            </label>
            <select
              value={contractId}
              onChange={e => handleSelectContract(e.target.value)}
              className="w-full bg-slate-50 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">-- Chọn hợp đồng --</option>
              {MOCK_CONTRACTS.map(c => (
                <option key={c.id} value={c.id}>{c.id} — {c.customerName} (Phòng {c.room})</option>
              ))}
            </select>
            {errors.contract && <p className="text-red-500 text-xs mt-1">{errors.contract}</p>}
          </div>

          {/* Auto-fill thông tin */}
          {selectedContract && (
            <div className="bg-blue-50 rounded-xl p-4 flex gap-6 text-sm">
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Khách hàng</p>
                <p className="font-bold text-slate-800">{selectedContract.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Phòng</p>
                <p className="font-bold text-slate-800">Phòng {selectedContract.room}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Số giường</p>
                <p className="font-bold text-slate-800">{selectedContract.beds.length} giường</p>
              </div>
            </div>
          )}

          {/* Checklist từng giường */}
          {beds.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Tình trạng thiết bị theo giường
              </label>
              <div className="space-y-4">
                {beds.map((bed, i) => (
                  <BedChecklist
                    key={bed.bedName}
                    bed={bed}
                    editable={true}
                    onChange={updated => updateBed(i, updated)}
                  />
                ))}
              </div>
              {hasDamage && (
                <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-amber-500 text-lg mt-0.5">warning</span>
                  <p className="text-sm text-amber-700">Có thiết bị hư hỏng hoặc mất — vui lòng ghi chú chi tiết bên dưới.</p>
                </div>
              )}
            </div>
          )}

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Ghi chú</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Mô tả thêm tình trạng phòng, thiết bị hoặc các lưu ý đặc biệt..."
              className="w-full bg-slate-50 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
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
            <span className="material-symbols-outlined text-base">draw</span>
            Lưu &amp; Ký
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Report Detail Modal ──────────────────────────────────────────────────────

const ReportDetailModal = ({
  report,
  onClose,
}: {
  report: HandoverReport;
  onClose: () => void;
}) => {
  const allGood = isReportGood(report);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">

        <div className="flex items-start justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900">Biên bản {report.id}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                report.type === 'check-in' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {report.type === 'check-in' ? 'Nhận phòng' : 'Trả phòng'}
              </span>
            </div>
            <p className="text-slate-500 text-sm">Lập ngày {report.createdDate} · bởi {report.createdBy}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors mt-1">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
          {/* Thông tin chung */}
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Hợp đồng', report.contractId],
              ['Khách hàng', report.customerName],
              ['Phòng', `Phòng ${report.room}`],
              ['Số giường', `${report.beds.length} giường`],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Tổng kết */}
          <div className={`rounded-xl p-4 flex items-center gap-3 ${allGood ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
            <span className={`material-symbols-outlined text-xl ${allGood ? 'text-emerald-600' : 'text-amber-600'}`}>
              {allGood ? 'check_circle' : 'report_problem'}
            </span>
            <p className={`text-sm font-semibold ${allGood ? 'text-emerald-700' : 'text-amber-700'}`}>
              {allGood ? 'Tất cả thiết bị trong tình trạng tốt.' : 'Có thiết bị cần lưu ý.'}
            </p>
          </div>

          {/* Chi tiết từng giường */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Tình trạng từng giường
            </p>
            <div className="space-y-3">
              {report.beds.map(bed => (
                <BedChecklist key={bed.bedName} bed={bed} editable={false} />
              ))}
            </div>
          </div>

          {/* Ghi chú */}
          {report.note && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ghi chú</p>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">{report.note}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end px-7 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AdminHandover = () => {
  const [reports, setReports] = useState<HandoverReport[]>(MOCK_REPORTS);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'check-in' | 'check-out'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<HandoverReport | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const filtered = useMemo(() => reports.filter(r => {
    const kw = keyword.toLowerCase();
    const matchKw = !keyword ||
      r.id.toLowerCase().includes(kw) ||
      r.customerName.toLowerCase().includes(kw) ||
      r.contractId.toLowerCase().includes(kw) ||
      r.room.toLowerCase().includes(kw);
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchKw && matchType;
  }), [reports, keyword, typeFilter]);

  const stats = useMemo(() => ({
    total: reports.length,
    checkIn: reports.filter(r => r.type === 'check-in').length,
    checkOut: reports.filter(r => r.type === 'check-out').length,
    hasDamage: reports.filter(r => !isReportGood(r)).length,
  }), [reports]);

  const handleCreate = (report: HandoverReport) => {
    setReports(prev => [report, ...prev]);
    setShowCreate(false);
    showSuccess(`Đã lập biên bản ${report.id} thành công!`);
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Biên bản Bàn giao Phòng</h1>
          <p className="text-slate-500 text-sm mt-1">Ghi nhận tình trạng thiết bị từng giường khi nhận và trả phòng</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-blue-200"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Lập biên bản mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng biên bản', value: stats.total, icon: 'description', color: 'text-blue-600 bg-blue-50' },
          { label: 'Nhận phòng', value: stats.checkIn, icon: 'login', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Trả phòng', value: stats.checkOut, icon: 'logout', color: 'text-purple-600 bg-purple-50' },
          { label: 'Có hư hỏng', value: stats.hasDamage, icon: 'report_problem', color: 'text-amber-600 bg-amber-50' },
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
            placeholder="Tìm theo mã biên bản, hợp đồng, khách hàng, phòng..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {([['all', 'Tất cả'], ['check-in', 'Nhận phòng'], ['check-out', 'Trả phòng']] as const).map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setTypeFilter(val)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                typeFilter === val ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3">folder_open</span>
            <p className="font-medium">Không tìm thấy biên bản phù hợp</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Mã BB</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Loại</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Hợp đồng / Khách hàng</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Phòng</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Giường</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Tình trạng</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Ngày lập</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(report => {
                const allGood = isReportGood(report);
                return (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelected(report)}
                  >
                    <td className="px-5 py-4 font-bold text-blue-700">{report.id}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        report.type === 'check-in' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {report.type === 'check-in' ? 'Nhận phòng' : 'Trả phòng'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{report.customerName}</p>
                      <p className="text-xs text-slate-400">{report.contractId}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">Phòng {report.room}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {report.beds.map(b => (
                          <span key={b.bedName} className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                            isBedGood(b) ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {b.bedName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold border ${
                        allGood ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${allGood ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {allGood ? 'Tốt' : 'Có hư hỏng'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{report.createdDate}</td>
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
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            Hiển thị {filtered.length} / {reports.length} biên bản
          </div>
        )}
      </div>

      {showCreate && <CreateReportModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {selected && <ReportDetailModal report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};
