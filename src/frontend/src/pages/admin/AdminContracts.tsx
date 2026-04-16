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

// ─── Hardcoded Contract Terms ─────────────────────────────────────────────────

const BASE_RENT_PER_BED = 1_500_000;

const SERVICE_FEES = [
  { name: 'Điện', price: '3.500 đ/kWh', note: 'Theo chỉ số công tơ, thanh toán cuối tháng' },
  { name: 'Nước', price: '50.000 đ/người/tháng', note: 'Định mức 4m³/người, vượt tính thêm' },
  { name: 'Internet & Wifi', price: '50.000 đ/phòng/tháng', note: 'Tốc độ tối thiểu 50 Mbps' },
  { name: 'Vệ sinh chung', price: '30.000 đ/người/tháng', note: 'Bao gồm hành lang và khu vực sinh hoạt chung' },
  { name: 'Bảo vệ & an ninh', price: 'Miễn phí', note: 'Hoạt động 24/7' },
];

const DEPOSIT_RULES = [
  {
    icon: 'check_circle',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    title: 'Hoàn trả 100% tiền cọc',
    detail: 'Không có hư hỏng tài sản, thanh toán đầy đủ các khoản phí, và thông báo chấm dứt hợp đồng trước ít nhất 30 ngày.',
  },
  {
    icon: 'remove_circle',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    title: 'Khấu trừ chi phí sửa chữa',
    detail: 'Trường hợp có hư hỏng tài sản được ghi nhận trong biên bản bàn giao, chi phí sửa chữa sẽ được khấu trừ trực tiếp vào tiền cọc.',
  },
  {
    icon: 'cancel',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    title: 'Không hoàn trả tiền cọc',
    detail: 'Vi phạm hợp đồng nghiêm trọng, tự ý rời đi không báo trước, hoặc còn nợ phí chưa thanh toán sau khi trừ tiền cọc.',
  },
];

const HOUSE_RULES = [
  { icon: 'volume_off', text: 'Không gây tiếng ồn sau 22:00 và trước 06:00.' },
  { icon: 'smoke_free', text: 'Cấm hút thuốc lá trong toàn bộ khuôn viên ký túc xá.' },
  { icon: 'pets', text: 'Không nuôi thú cưng dưới mọi hình thức.' },
  { icon: 'lock', text: 'Khoá cửa phòng khi ra ngoài và khi đi ngủ.' },
  { icon: 'no_food', text: 'Không nấu ăn trong phòng, chỉ sử dụng bếp sinh hoạt chung.' },
  { icon: 'people', text: 'Không cho người ngoài ở lại qua đêm khi chưa đăng ký.' },
  { icon: 'cleaning_services', text: 'Giữ vệ sinh phòng và khu vực sinh hoạt chung sạch sẽ.' },
  { icon: 'electrical_services', text: 'Không sử dụng thiết bị điện công suất lớn chưa được phê duyệt.' },
];

const VIOLATION_TERMS = [
  {
    level: 'Lần 1',
    badge: 'bg-yellow-100 text-yellow-800',
    action: 'Nhắc nhở bằng văn bản',
    detail: 'Ban quản lý gửi thông báo nhắc nhở và yêu cầu cam kết không tái phạm.',
  },
  {
    level: 'Lần 2',
    badge: 'bg-orange-100 text-orange-800',
    action: 'Phạt tiền 500.000 đ',
    detail: 'Áp dụng mức phạt theo quy định. Số tiền phạt được khấu trừ vào tiền cọc hoặc thanh toán trực tiếp.',
  },
  {
    level: 'Lần 3',
    badge: 'bg-red-100 text-red-800',
    action: 'Chấm dứt hợp đồng',
    detail: 'Ban quản lý có quyền đơn phương chấm dứt hợp đồng và yêu cầu bàn giao phòng trong vòng 7 ngày.',
  },
];

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

function fmtMoney(n: number) {
  return n.toLocaleString('vi-VN') + ' đ';
}

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

  const toggleBed = (bed: string) =>
    setSelectedBeds(prev => prev.includes(bed) ? prev.filter(b => b !== bed) : [...prev, bed]);

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
    onCreate({
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
    });
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
              {selectedBeds.length > 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  Tiền thuê dự kiến: <span className="font-bold text-blue-700">{fmtMoney(BASE_RENT_PER_BED * selectedBeds.length)}/tháng</span>
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-50 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full bg-slate-50 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Kỳ thanh toán</label>
            <div className="flex gap-3">
              {(['monthly', 'quarterly', 'yearly'] as PaymentPeriod[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPaymentPeriod(p)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    paymentPeriod === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'
                  }`}
                >
                  {PAYMENT_PERIOD_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-all">Huỷ</button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all active:scale-95">
            <span className="material-symbols-outlined text-base">save</span>
            Lưu hợp đồng
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
  const [tab, setTab] = useState<DetailTab>('info');
  const [editing, setEditing] = useState(false);
  const [customerName, setCustomerName] = useState(contract.customerName);
  const [cccd, setCccd] = useState(contract.cccd);
  const [phone, setPhone] = useState(contract.phone);
  const [startDate, setStartDate] = useState(contract.startDate);
  const [endDate, setEndDate] = useState(contract.endDate);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const totalRent = BASE_RENT_PER_BED * contract.beds.length;
  const deposit = totalRent * 2;

  const handleSave = () => {
    onUpdate({ ...contract, customerName, cccd, phone, startDate, endDate });
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">

        {/* ── Modal Header ── */}
        <div className="px-7 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-slate-900">Hợp đồng {contract.id}</h2>
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[contract.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[contract.status]}`} />
                  {contract.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm">Lập ngày {contract.createdDate} · Phiếu cọc {contract.depositFormId}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors mt-1">
              <span className="material-symbols-outlined text-slate-500">close</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-slate-100 p-1 rounded-lg w-fit">
            {([['info', 'Thông tin hợp đồng'], ['terms', 'Điều khoản & Nội quy']] as const).map(([key, label]) => (
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

            {/* Tiêu đề hợp đồng */}
            <div className="text-center py-4 border border-slate-200 rounded-xl bg-slate-50">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Cộng hoà Xã hội Chủ nghĩa Việt Nam</p>
              <p className="text-xs text-slate-400 mb-3">Độc lập – Tự do – Hạnh phúc</p>
              <p className="text-lg font-black uppercase tracking-wide text-slate-800">Hợp đồng Thuê Phòng Ký túc xá</p>
              <p className="text-sm text-slate-500 mt-1">Số: <span className="font-bold text-slate-700">{contract.id}</span></p>
            </div>

            {/* Thông tin bên thuê */}
            <div>
              <SectionTitle number="I" title="Thông tin bên thuê" />
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 pl-10">
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-slate-500 min-w-32">Họ và tên:</span>
                  {editing
                    ? <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                        className="bg-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-1" />
                    : <span className="text-sm font-semibold text-slate-800">{customerName}</span>}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-slate-500 min-w-32">Số CCCD/CMND:</span>
                  {editing
                    ? <input value={cccd} onChange={e => setCccd(e.target.value)}
                        className="bg-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-1" />
                    : <span className="text-sm font-semibold text-slate-800">{cccd}</span>}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-slate-500 min-w-32">Số điện thoại:</span>
                  {editing
                    ? <input value={phone} onChange={e => setPhone(e.target.value)}
                        className="bg-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-1" />
                    : <span className="text-sm font-semibold text-slate-800">{phone}</span>}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-slate-500 min-w-32">Phiếu đặt cọc:</span>
                  <span className="text-sm font-semibold text-slate-800">{contract.depositFormId}</span>
                </div>
              </div>
            </div>

            {/* Đối tượng hợp đồng */}
            <div>
              <SectionTitle number="II" title="Đối tượng hợp đồng" />
              <div className="pl-10 space-y-3">
                <div className="flex gap-2">
                  <span className="text-sm text-slate-500 min-w-32">Phòng:</span>
                  <span className="text-sm font-semibold text-slate-800">Phòng {contract.room}</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-sm text-slate-500 min-w-32">Giường thuê:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {contract.beds.map(b => (
                      <span key={b} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Thời hạn & thanh toán */}
            <div>
              <SectionTitle number="III" title="Thời hạn & thanh toán" />
              <div className="pl-10 grid grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-slate-500 min-w-32">Ngày bắt đầu:</span>
                  {editing
                    ? <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        className="bg-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    : <span className="text-sm font-semibold text-slate-800">{contract.startDate}</span>}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-slate-500 min-w-32">Ngày kết thúc:</span>
                  {editing
                    ? <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        className="bg-slate-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    : <span className="text-sm font-semibold text-slate-800">{contract.endDate}</span>}
                </div>
                <div className="flex gap-2">
                  <span className="text-sm text-slate-500 min-w-32">Kỳ thanh toán:</span>
                  <span className="text-sm font-semibold text-slate-800">{PAYMENT_PERIOD_LABEL[contract.paymentPeriod]}</span>
                </div>
              </div>
            </div>

            {/* Tài chính */}
            <div>
              <SectionTitle number="IV" title="Tài chính" />
              <div className="pl-10 space-y-2">
                <div className="flex items-center justify-between py-2.5 border-b border-dashed border-slate-200">
                  <div>
                    <span className="text-sm text-slate-600">Giá thuê cơ bản</span>
                    <span className="text-xs text-slate-400 ml-2">({contract.beds.length} giường × {fmtMoney(BASE_RENT_PER_BED)})</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{fmtMoney(totalRent)}/tháng</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-dashed border-slate-200">
                  <span className="text-sm text-slate-600">Tiền đặt cọc</span>
                  <span className="text-sm font-bold text-slate-800">{fmtMoney(deposit)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-600">Phí dịch vụ</span>
                  <span className="text-sm font-medium text-slate-500">Tính thêm theo thực tế</span>
                </div>
              </div>
            </div>

            {/* Confirm cancel */}
            {confirmCancel && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-3">
                  Xác nhận huỷ hợp đồng {contract.id}? Thao tác này không thể hoàn tác.
                </p>
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
        )}

        {/* ── Tab: Điều khoản ── */}
        {tab === 'terms' && (
          <div className="flex-1 overflow-y-auto px-7 py-6 space-y-8">

            {/* Phí dịch vụ */}
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

            {/* Hoàn cọc */}
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

            {/* Nội quy */}
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

            {/* Xử lý vi phạm */}
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

            {/* Điều khoản chung */}
            <div>
              <SectionTitle number="V" title="Điều khoản chung" />
              <div className="pl-10 space-y-2 text-sm text-slate-600">
                <p>• Hợp đồng có hiệu lực kể từ ngày ký và được lập thành 02 bản, mỗi bên giữ 01 bản.</p>
                <p>• Mọi tranh chấp phát sinh được giải quyết trên tinh thần thương lượng hoà giải. Trường hợp không đạt được thoả thuận, tranh chấp sẽ được giải quyết theo quy định của pháp luật hiện hành.</p>
                <p>• Bên thuê không được tự ý chuyển nhượng, cho thuê lại hoặc cho mượn phòng dưới bất kỳ hình thức nào.</p>
                <p>• Mọi thay đổi, bổ sung nội dung hợp đồng phải được lập thành văn bản và có chữ ký của cả hai bên.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          {tab === 'info' && contract.status === 'Hiệu lực' && !confirmCancel && (
            <button
              onClick={() => setConfirmCancel(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-all"
            >
              <span className="material-symbols-outlined text-base">cancel</span>
              Huỷ hợp đồng
            </button>
          )}
          {!(tab === 'info' && contract.status === 'Hiệu lực' && !confirmCancel) && <div />}

          <div className="flex gap-2">
            {tab === 'info' && contract.status === 'Hiệu lực' && !editing && !confirmCancel && (
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
                <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-all">Huỷ</button>
                <button onClick={handleSave} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all">Lưu</button>
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
    const matchKw = !keyword || c.id.toLowerCase().includes(kw) || c.customerName.toLowerCase().includes(kw)
      || c.room.toLowerCase().includes(kw) || c.phone.includes(kw);
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
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Tiền thuê</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Thời hạn</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => setSelected(c)}>
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
                    <p className="font-bold text-slate-800">{fmtMoney(BASE_RENT_PER_BED * c.beds.length)}</p>
                    <p className="text-xs text-slate-400">{PAYMENT_PERIOD_LABEL[c.paymentPeriod]}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-slate-700">{c.startDate}</p>
                    <p className="text-xs text-slate-400">→ {c.endDate}</p>
                  </td>
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
