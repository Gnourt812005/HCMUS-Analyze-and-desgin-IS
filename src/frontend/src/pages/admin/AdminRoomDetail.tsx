import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ApiClient } from '../../api/ApiClient';
import { RoomDTO, BedDTO, DormDTO, CreateRoomDTO, UpdateRoomDTO, UtilityDTO } from '@dormarch/shared';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminRoomDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isNew = id === 'create' || id === 'new' || pathname.endsWith('/create') || pathname.endsWith('/new');

    const [room, setRoom] = useState<RoomDTO | null>(null);
    const [dorms, setDorms] = useState<DormDTO[]>([]);
    const [loading, setLoading] = useState(!isNew);
    const [isEditing, setIsEditing] = useState(isNew);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [formData, setFormData] = useState<any>({
        name: '',
        dormId: '',
        block: '',
        floor: 1,
        status: 'AVAILABLE',
        utilityIds: []
    });

    // Bed Modal state
    const [isBedModalOpen, setIsBedModalOpen] = useState(false);
    const [editingBed, setEditingBed] = useState<BedDTO | null>(null);
    const [bedFormData, setBedFormData] = useState({
        bedNumber: '',
        price: 0,
        status: 'AVAILABLE',
        utilityIds: [] as string[]
    });

    const [availableUtilities, setAvailableUtilities] = useState<UtilityDTO[]>([]);

    const fetchData = async () => {
        try {
            const [dormRes, utilRes] = await Promise.all([
                ApiClient.get<{ data: { dorms: DormDTO[] } }>('/dorms?limit=100'),
                ApiClient.get<{ data: { utilities: UtilityDTO[] } }>('/utilities?limit=200&type=ROOM')
            ]);
            console.log(utilRes.data)
            setDorms(dormRes.data.dorms);
            setAvailableUtilities(utilRes.data.utilities);

            if (!isNew && id) {
                setLoading(true);
                const res = await ApiClient.get<{ data: RoomDTO }>(`/rooms/${id}`);
                setRoom(res.data);
                const initialUtilityIds = res.data.utilityIds || res.data.amenities?.map(title =>
                    utilRes.data.utilities.find(u => u.title === title)?.id
                ).filter(id => !!id) as string[];

                setFormData({
                    name: res.data.name,
                    dormId: res.data.dormId,
                    block: res.data.block,
                    floor: res.data.floor,
                    status: res.data.status,
                    utilityIds: initialUtilityIds
                });
            }
        } catch (error) {
            console.error('Failed to fetch room details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSaveRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (isNew) {
                await ApiClient.post('/rooms', { body: JSON.stringify({ ...formData, totalBeds: 0 }) });
                alert('Tạo phòng mới thành công');
                navigate('/admin/rooms');
            } else {
                await ApiClient.put(`/rooms/${id}`, { body: JSON.stringify(formData) });
                alert('Cập nhật thành công');
                setIsEditing(false);
                fetchData();
            }
        } catch (error) {
            alert('Lỗi khi lưu thông tin phòng');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBedAction = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBed) {
                await ApiClient.put(`/rooms/beds/${editingBed.id}`, { body: JSON.stringify(bedFormData) });
                alert('Cập nhật giường thành công');
            } else {
                await ApiClient.post(`/rooms/${id}/beds`, { body: JSON.stringify(bedFormData) });
                alert('Thêm giường thành công');
            }
            setIsBedModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Lỗi khi lưu thông tin giường');
        }
    };

    const handleDeleteBed = async (bedId: string) => {
        if (!window.confirm('Xác nhận xóa giường này?')) return;
        try {
            await ApiClient.delete(`/rooms/beds/${bedId}`);
            fetchData();
        } catch (error) {
            alert('Lỗi khi xóa giường. Có thể giường đang có khách thuê.');
        }
    };

    const openBedModal = (bed?: BedDTO) => {
        if (bed) {
            setEditingBed(bed);
            setBedFormData({
                bedNumber: bed.bedNumber,
                price: bed.price,
                status: bed.status,
                utilityIds: bed.utilityIds || []
            });
        } else {
            setEditingBed(null);
            setBedFormData({
                bedNumber: '',
                price: 0,
                status: 'AVAILABLE',
                utilityIds: []
            });
        }
        setIsBedModalOpen(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/rooms')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {isNew ? 'Thêm phòng mới' : `Phòng ${room?.name}`}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {isNew ? 'Thiết lập cấu hình phòng mới' : 'Quản lý thông tin và danh sách giường'}
                        </p>
                    </div>
                </div>

                {!isNew && (
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-5 py-2.5 rounded-xl font-bold transition-all ${isEditing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                    >
                        <span className="material-symbols-outlined text-[20px] mr-2 inline-block align-middle">{isEditing ? 'close' : 'edit'}</span>
                        <span className="inline-block align-middle">{isEditing ? 'Hủy sửa' : 'Chỉnh sửa phòng'}</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-800 mb-6 border-b border-slate-100 pb-4">Thông tin cơ bản</h3>
                        <form onSubmit={handleSaveRoom} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Số / Tên phòng</label>
                                    <input
                                        disabled={!isEditing}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Thuộc KTX</label>
                                    <select
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-70 outline-none"
                                        value={formData.dormId}
                                        onChange={e => setFormData({ ...formData, dormId: e.target.value })}
                                    >
                                        <option value="">Chọn KTX</option>
                                        {dorms.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Dãy / Khối (Block)</label>
                                    <input
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-70 outline-none"
                                        value={formData.block}
                                        onChange={e => setFormData({ ...formData, block: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tầng</label>
                                    <input
                                        disabled={!isEditing}
                                        type="number"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-70 outline-none"
                                        value={formData.floor}
                                        onChange={e => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Trạng thái phòng</label>
                                <select
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-70 outline-none"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="AVAILABLE">Đang hoạt động</option>
                                    <option value="MAINTENANCE">Đang bảo trì</option>
                                    <option value="FULL">Đã đầy (Hệ thống tự tính)</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tiện ích trong phòng</label>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div className="overflow-hidden bg-white border border-slate-100 rounded-2xl">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiện ích</th>
                                                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tình trạng</th>
                                                        <th className="px-4 py-3"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {formData.utilityIds.map((utilId: string) => {
                                                        const utility = availableUtilities.find(u => u.id === utilId);
                                                        // Find status from room.utilities if present
                                                        const detail = room?.utilities?.find(ud => ud.id === utilId);
                                                        const status = detail?.status || 'GOOD';
                                                        
                                                        return (
                                                            <tr key={utilId} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-4 py-3 text-sm font-bold text-slate-700">{utility?.title || '...'}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                                        status === 'GOOD' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                                    }`}>
                                                                        {status === 'GOOD' ? 'Hoạt động tốt' : 'Cần bảo trì'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setFormData({ ...formData, utilityIds: formData.utilityIds.filter((id: string) => id !== utilId) })}
                                                                        className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    {formData.utilityIds.length === 0 && (
                                                        <tr>
                                                            <td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-xs italic">Chưa có tiện ích nào</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <select
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm appearance-none"
                                            value=""
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                if (id && !formData.utilityIds.includes(id)) {
                                                    setFormData({ ...formData, utilityIds: [...formData.utilityIds, id] });
                                                }
                                            }}
                                        >
                                            <option value="" disabled>+ Thêm tiện ích phòng...</option>
                                            {availableUtilities.filter(u => u.type === 'ROOM' && !formData.utilityIds.includes(u.id)).map(u => (
                                                <option key={u.id} value={u.id}>{u.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden bg-white border border-slate-100 rounded-2xl">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiện ích</th>
                                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {room?.utilities?.map(u => (
                                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-sm font-bold text-slate-700">{u.title}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                                u.status === 'GOOD' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                            }`}>
                                                                {u.status === 'GOOD' ? 'Hoạt động tốt' : 'Cần bảo trì'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!room?.utilities || room.utilities.length === 0) && (
                                                    <tr>
                                                        <td colSpan={2} className="px-4 py-8 text-center text-slate-400 text-xs italic">Không có tiện ích</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                    {isSubmitting ? 'Đ đang lưu...' : (isNew ? 'Tạo phòng mới' : 'Lưu thay đổi')}
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* Bed Management Section */}
                <div className="lg:col-span-7 space-y-8">
                    {!isNew ? (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                                <h3 className="font-bold text-lg text-slate-800">Quản lý Giường ({room?.beds?.length || 0})</h3>
                                <button
                                    onClick={() => openBedModal()}
                                    className="flex items-center gap-2 text-sm font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-5 py-2.5 rounded-xl transition-all"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add_box</span>
                                    Thêm giường
                                </button>
                            </div>
                            <div className="overflow-x-auto grow">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase font-bold tracking-widest border-b border-slate-100">
                                            <th className="px-8 py-4">Mã / Tên giường</th>
                                            <th className="px-8 py-4">Đơn giá</th>
                                            <th className="px-8 py-4">Trạng thái</th>
                                            <th className="px-8 py-4 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {room?.beds?.map((bed) => (
                                            <tr key={bed.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs uppercase group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                            {bed.bedNumber.substring(0, 1) || 'G'}
                                                        </div>
                                                        <span className="font-bold text-slate-700 uppercase">{bed.bedNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="font-bold text-slate-900">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bed.price)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${bed.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        bed.status === 'BOOKED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                        {bed.status === 'AVAILABLE' ? 'TRỐNG' : bed.status === 'BOOKED' ? 'ĐÃ THUÊ' : 'ĐẶT CỌC'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right flex items-center justify-end gap-1">
                                                    <button onClick={() => openBedModal(bed)} className="text-blue-600 hover:bg-blue-50 p-2.5 rounded-xl transition-colors" title="Sửa"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                                    <button onClick={() => handleDeleteBed(bed.id)} className="text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-colors" title="Xóa"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                                </td>
                                            </tr>
                                        ))}

                                        {(!room?.beds || room.beds.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">
                                                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-20">hotel</span>
                                                    Phòng này chưa có giường. Hãy thêm mới để bắt đầu kinh doanh.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50/50 rounded-3xl p-12 border border-dashed border-blue-200 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                            <div className="bg-white p-5 rounded-full shadow-sm text-blue-600 mb-6 font-bold">
                                <span className="material-symbols-outlined text-4xl mt-1">hotel_class</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Quản lý giường</h3>
                            <p className="text-slate-500 max-w-sm mt-2">Bạn cần hoàn tất tạo phòng trước khi có thể cấu hình danh sách giường và đơn giá riêng lẻ.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bed Modal */}
            <AnimatePresence>
                {isBedModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBedModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-white rounded-[32px] shadow-2xl relative z-10 w-full max-w-md overflow-hidden border border-slate-200">
                            <div className="p-10 border-b border-slate-100">
                                <h3 className="text-2xl font-bold text-slate-900">{editingBed ? 'Cập nhật giường' : 'Thêm giường mới'}</h3>
                                <p className="text-slate-500 mt-2">Thông tin giường thuộc phòng <span className="text-blue-600 font-bold uppercase">{room?.name}</span></p>
                            </div>
                            <form onSubmit={handleBedAction} className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mã số / Vị trí giường</label>
                                    <input
                                        required
                                        autoFocus
                                        placeholder="VD: G01-A, Tầng 1 - Trái"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold"
                                        value={bedFormData.bedNumber}
                                        onChange={e => setBedFormData({ ...bedFormData, bedNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Đơn giá tháng (VND)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold"
                                        value={bedFormData.price}
                                        onChange={e => setBedFormData({ ...bedFormData, price: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Trạng thái hiện tại</label>
                                    <select
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold appearance-none bg-white"
                                        value={bedFormData.status}
                                        onChange={e => setBedFormData({ ...bedFormData, status: e.target.value })}
                                    >
                                        <option value="AVAILABLE">CÒN TRỐNG</option>
                                        <option value="BOOKED">ĐÃ THUÊ</option>
                                        <option value="RESERVED">ĐÃ ĐẶT CỌC</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Danh sách tiện ích tại giường</label>
                                    
                                    <div className="overflow-hidden bg-white border border-slate-100 rounded-2xl">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiện ích</th>
                                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tình trạng</th>
                                                    <th className="px-4 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {bedFormData.utilityIds.map((utilId: string) => {
                                                    const utility = availableUtilities.find(u => u.id === utilId);
                                                    const detail = editingBed?.utilities?.find(ud => ud.id === utilId);
                                                    const status = detail?.status || 'GOOD';

                                                    return (
                                                        <tr key={utilId} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-4 py-3 text-sm font-bold text-slate-700">{utility?.title || '...'}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                                    status === 'GOOD' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                                }`}>
                                                                    {status === 'GOOD' ? 'Hoạt động tốt' : 'Cần bảo trì'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setBedFormData({ ...bedFormData, utilityIds: bedFormData.utilityIds.filter(id => id !== utilId) })}
                                                                    className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {bedFormData.utilityIds.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-xs italic">Chưa chọn tiện ích</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Dropdown Selector */}
                                    <select
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold appearance-none"
                                        value=""
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            if (id && !bedFormData.utilityIds.includes(id)) {
                                                setBedFormData({ ...bedFormData, utilityIds: [...bedFormData.utilityIds, id] });
                                            }
                                        }}
                                    >
                                        <option value="">+ Thêm tiện ích giường</option>
                                        {availableUtilities.filter(u => u.type === 'BED').map(u => (
                                            <option key={u.id} value={u.id} disabled={bedFormData.utilityIds.includes(u.id)}>
                                                {u.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsBedModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Hủy</button>
                                    <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]">
                                        {editingBed ? 'Cập nhật' : 'Thêm mới'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
