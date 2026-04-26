import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ApiClient } from '../../api/ApiClient';
import { DormDTO, CreateDormDTO, UpdateDormDTO, UtilityDTO } from '@dormarch/shared';
import { motion } from 'framer-motion';

export const AdminDormDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isNew = id === 'new' || !id;
    const queryParams = new URLSearchParams(location.search);
    const initialEdit = queryParams.get('edit') === 'true' || isNew;

    const [dorm, setDorm] = useState<DormDTO | null>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(!isNew);
    const [isEditing, setIsEditing] = useState(initialEdit);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableUtilities, setAvailableUtilities] = useState<UtilityDTO[]>([]);

    // Form states
    const [formData, setFormData] = useState<CreateDormDTO | UpdateDormDTO>({
        name: '',
        address: '',
        phone: '',
        totalRooms: 0,
        managerId: '',
        status: 'Còn phòng',
        utilityIds: []
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dormRes, roomsRes, utilsRes] = await Promise.all([
                isNew ? Promise.resolve({ data: null }) : ApiClient.get<{ data: DormDTO }>(`/dorms/${id}`),
                isNew ? Promise.resolve({ data: [] }) : ApiClient.get<{ data: any[] }>(`/dorms/${id}/rooms`),
                ApiClient.get<{ data: { utilities: UtilityDTO[] } }>('/utilities?limit=100')
            ]);

            setAvailableUtilities(utilsRes.data.utilities);

            if (dormRes.data) {
                setDorm(dormRes.data);
                setRooms(roomsRes.data);
                
                // Prefill form
                setFormData({
                    name: dormRes.data.name,
                    address: dormRes.data.address,
                    phone: dormRes.data.phone,
                    totalRooms: dormRes.data.totalRooms,
                    managerId: dormRes.data.managerId,
                    status: dormRes.data.status,
                    utilityIds: dormRes.data.utilityIds || []
                });
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (isNew) {
                await ApiClient.post('/dorms', {
                    body: JSON.stringify(formData)
                });
                alert('Thêm cơ sở mới thành công');
                navigate('/admin/dorms');
            } else {
                await ApiClient.put(`/dorms/${id}`, {
                    body: JSON.stringify(formData)
                });
                alert('Cập nhật thành công');
                setIsEditing(false);
                fetchData();
            }
        } catch (error) {
            alert('Lỗi khi lưu thông tin');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!isNew && !dorm) return (
        <div className="p-20 text-center bg-white rounded-3xl border border-slate-200">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">error</span>
            <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy cơ sở</h2>
            <button onClick={() => navigate('/admin/dorms')} className="mt-4 text-blue-600 font-bold hover:underline">Quay lại danh sách</button>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin/dorms')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {isNew ? 'Thêm cơ sở mới' : dorm?.name}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {isNew ? 'Điền thông tin để đăng ký cơ sở lưu trú mới' : 'Chi tiết và cấu hình hệ thống'}
                        </p>
                    </div>
                </div>

                {!isNew && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                                isEditing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{isEditing ? 'close' : 'edit'}</span>
                            {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa cơ sở'}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Information Section */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-slate-800">Thông tin cơ bản</h3>
                            {!isEditing && (
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    dorm?.status === 'Còn phòng' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                    'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                    {dorm?.status}
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <form id="dorm-form" onSubmit={handleSave} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tên ký túc xá</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Địa chỉ</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Số điện thoại</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tổng phòng</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                            value={formData.totalRooms}
                                            onChange={e => setFormData({ ...formData, totalRooms: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Trạng thái</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium outline-none appearance-none"
                                            value={'Còn phòng'}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        >
                                            <option value="Còn phòng">Còn phòng</option>
                                            <option value="Hết phòng">Hết phòng</option>
                                            <option value="Sắp đầy">Sắp đầy</option>
                                            <option value="Đã ẩn">Đã ẩn</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email quản lý</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        value={formData.managerId}
                                        onChange={e => setFormData({ ...formData, managerId: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tiện ích KTX</label>
                                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[60px]">
                                        {formData.utilityIds?.map((utilId: string) => {
                                            const utility = availableUtilities.find(u => u.id === utilId);
                                            return (
                                                <span key={utilId} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-200">
                                                    {utility?.title || '...'}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, utilityIds: formData.utilityIds?.filter(id => id !== utilId) })}
                                                        className="hover:text-blue-900 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                                    </button>
                                                </span>
                                            );
                                        })}
                                        {formData.utilityIds?.length === 0 && <span className="text-slate-400 text-xs italic">Chưa chọn tiện ích nào</span>}
                                    </div>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium outline-none appearance-none"
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val && !formData.utilityIds?.includes(val)) {
                                                setFormData({ ...formData, utilityIds: [...(formData.utilityIds || []), val] });
                                            }
                                            e.target.value = '';
                                        }}
                                    >
                                        <option value="">+ Thêm tiện ích</option>
                                        {availableUtilities.map(u => (
                                            <option key={u.id} value={u.id} disabled={formData.utilityIds?.includes(u.id)}>
                                                {u.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                    {isSubmitting ? 'Đang lưu...' : (isNew ? 'Lưu cơ sở mới' : 'Lưu thay đổi')}
                                </motion.button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-500">
                                        <span className="material-symbols-outlined">phone</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hotline</p>
                                        <p className="font-bold text-slate-700">{dorm?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-500">
                                        <span className="material-symbols-outlined">meeting_room</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấu hình phòng</p>
                                        <p className="font-bold text-slate-700">{dorm?.availableRooms} / {dorm?.totalRooms} phòng trống</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-amber-50 p-2.5 rounded-xl text-amber-500">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Người quản lý</p>
                                        <p className="font-bold text-slate-700">{dorm?.managerId}</p>
                                    </div>
                                </div>

                                {/* View Mode Utilities */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiện ích cơ sở</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {dorm?.utilityIds?.map(utilId => {
                                            const utility = availableUtilities.find(u => u.id === utilId);
                                            return (
                                                <div key={utilId} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                                    <span className="material-symbols-outlined text-[18px] text-blue-500">task_alt</span>
                                                    <span className="text-sm font-medium">{utility?.title}</span>
                                                </div>
                                            );
                                        })}
                                        {(!dorm?.utilityIds || dorm.utilityIds.length === 0) && (
                                            <p className="text-sm text-slate-400 italic">Chưa có tiện ích nào</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rooms List Section */}
                <div className="lg:col-span-8">
                    {!isNew ? (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-slate-800">Cấu trúc phòng ({rooms.length})</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex bg-slate-50 p-1 rounded-xl">
                                        <button className="px-4 py-1.5 rounded-lg text-sm font-bold bg-white shadow-sm text-slate-700">Tất cả</button>
                                        <button className="px-4 py-1.5 rounded-lg text-sm font-bold text-slate-400 hover:text-slate-600">Trống</button>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase font-bold tracking-widest">
                                            <th className="px-8 py-4">Tên phòng</th>
                                            <th className="px-8 py-4">Loại hình</th>
                                            <th className="px-8 py-4 text-right">Giá thuê</th>
                                            <th className="px-8 py-4 text-center">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {rooms.map((room, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-slate-700">{room.roomName}</p>
                                                    <p className="text-xs text-slate-400">Tầng {Math.floor(idx / 10) + 1}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-sm text-slate-600 font-medium">{room.type || 'Tiêu chuẩn'}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <p className="font-bold text-slate-900">{room.price?.toLocaleString()} đ</p>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold">
                                                        {room.status || 'Hoạt động'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {rooms.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">
                                                    Chưa có dữ liệu phòng cho ký túc xá này
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50/50 rounded-3xl p-10 border border-blue-100 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                            <div className="bg-blue-100/50 p-5 rounded-full text-blue-600 mb-6">
                                <span className="material-symbols-outlined text-4xl">domain_add</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Cấu hình phòng</h3>
                            <p className="text-slate-500 max-w-sm mt-2">
                                Sau khi tạo cơ sở mới, bạn có thể thực hiện quản lý danh sách phòng và giường tại đây.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
