import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ApiClient } from '../../api/ApiClient';
import { DormDTO, CreateDormDTO, UpdateDormDTO, UtilityDTO, DormFeeDTO, UpdateDormFeeDTO } from '@dormarch/shared';
import { motion } from 'framer-motion';

export const AdminDormDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isNew = id === 'new' || !id;
    const queryParams = new URLSearchParams(location.search);
    const initialEdit = queryParams.get('edit') === 'true' || isNew;

    const [dorm, setDorm] = useState<DormDTO | null>(null);
    const [dormFee, setDormFee] = useState<DormFeeDTO | null>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(!isNew);
    const [isEditing, setIsEditing] = useState(initialEdit);
    const [isEditingFees, setIsEditingFees] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingFees, setIsSubmittingFees] = useState(false);
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

    const [feeFormData, setFeeFormData] = useState<UpdateDormFeeDTO>({
        waterFee: 0,
        electricityFee: 0,
        wifiFee: 0,
        cleaningFee: 0
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dormRes, roomsRes, utilsRes, feeRes] = await Promise.all([
                isNew ? Promise.resolve({ data: null }) : ApiClient.get<{ data: DormDTO }>(`/admin/dorms/${id}`),
                isNew ? Promise.resolve({ data: { rooms: [], total: 0 } }) : ApiClient.get<{ data: { rooms: any[], total: number } }>(`/admin/rooms?dormId=${id}&limit=100`),
                ApiClient.get<{ data: { utilities: UtilityDTO[] } }>('/admin/utilities?limit=100?type=DORM'),
                isNew ? Promise.resolve({ data: null }) : ApiClient.get<{ data: DormFeeDTO }>(`/admin/dorms/${id}/fees`)
            ]);

            setAvailableUtilities(utilsRes.data.utilities);

            if (dormRes.data) {
                setDorm(dormRes.data);
                setRooms(roomsRes.data.rooms || []);
                
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

            if (feeRes.data) {
                setDormFee(feeRes.data);
                setFeeFormData({
                    waterFee: feeRes.data.waterFee,
                    electricityFee: feeRes.data.electricityFee,
                    wifiFee: feeRes.data.wifiFee,
                    cleaningFee: feeRes.data.cleaningFee
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
                await ApiClient.post('/admin/dorms', {
                    body: JSON.stringify(formData)
                });
                alert('Thêm cơ sở mới thành công');
                navigate('/admin/dorms');
            } else {
                await ApiClient.put(`/admin/dorms/${id}`, {
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

    const handleSaveFees = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmittingFees(true);
            await ApiClient.put(`/admin/dorms/${id}/fees`, {
                body: JSON.stringify(feeFormData)
            });
            alert('Cập nhật phí thành công');
            setIsEditingFees(false);
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Lỗi khi cập nhật phí');
        } finally {
            setIsSubmittingFees(false);
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
                                            readOnly
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

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Danh sách tiện ích tại cơ sở</label>
                                    
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
                                                {formData.utilityIds?.map((utilId: string) => {
                                                    const utility = availableUtilities.find(u => u.id === utilId);
                                                    const detail = dorm?.utilities?.find(ud => ud.id === utilId);
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
                                                                    onClick={() => setFormData({ ...formData, utilityIds: formData.utilityIds?.filter(id => id !== utilId) })}
                                                                    className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {(formData.utilityIds?.length === 0) && (
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-xs italic">Chưa chọn tiện ích</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium outline-none appearance-none font-bold"
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val && !formData.utilityIds?.includes(val)) {
                                                setFormData({ ...formData, utilityIds: [...(formData.utilityIds || []), val] });
                                            }
                                            e.target.value = '';
                                        }}
                                    >
                                        <option value="">+ Thêm tiện ích cơ sở</option>
                                        {availableUtilities.filter(u => u.type === 'DORM').map(u => (
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
                                        <p className="font-bold text-slate-700">{dorm?.availableRooms} / {dorm?.totalRooms} phòng  </p>
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

                                {/* View Mode Utilities Table */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bảng kê tiện ích cơ sở</h4>
                                    <div className="overflow-hidden bg-white border border-slate-100 rounded-2xl">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiện ích</th>
                                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {dorm?.utilities?.map(u => (
                                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-sm font-bold text-slate-700">{u.title}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                                                                u.status === 'GOOD' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                            }`}>
                                                                {u.status === 'GOOD' ? 'Hoạt động tốt' : 'Hỏng / Cần sửa'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!dorm?.utilities || dorm.utilities.length === 0) && (
                                                    <tr>
                                                        <td colSpan={2} className="px-4 py-8 text-center text-slate-400 text-xs italic">Không có dữ liệu</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dorm Fees Section */}
                    {!isNew && (
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-slate-800">Cấu hình chi phí</h3>
                                <button
                                    onClick={() => setIsEditingFees(!isEditingFees)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                        isEditingFees ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">{isEditingFees ? 'close' : 'edit'}</span>
                                    {isEditingFees ? 'Hủy' : 'Chỉnh sửa phí'}
                                </button>
                            </div>

                            {isEditingFees ? (
                                <form onSubmit={handleSaveFees} className="space-y-5">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiền nước (VNĐ)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                                                value={feeFormData.waterFee}
                                                onChange={e => setFeeFormData({ ...feeFormData, waterFee: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiền điện (VNĐ/kWh)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                                                value={feeFormData.electricityFee}
                                                onChange={e => setFeeFormData({ ...feeFormData, electricityFee: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiền Wifi (VNĐ/tháng)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                                                value={feeFormData.wifiFee}
                                                onChange={e => setFeeFormData({ ...feeFormData, wifiFee: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiền vệ sinh (VNĐ/tháng)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                                                value={feeFormData.cleaningFee}
                                                onChange={e => setFeeFormData({ ...feeFormData, cleaningFee: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmittingFees}
                                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        {isSubmittingFees ? 'Đang lưu...' : 'Lưu chi phí'}
                                    </motion.button>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-lg text-blue-500 shadow-sm">
                                                <span className="material-symbols-outlined text-[20px]">water_drop</span>
                                            </div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tiền nước</p>
                                        </div>
                                        <p className="font-bold text-slate-700">{dormFee?.waterFee.toLocaleString()} đ</p>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-lg text-amber-500 shadow-sm">
                                                <span className="material-symbols-outlined text-[20px]">bolt</span>
                                            </div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tiền điện</p>
                                        </div>
                                        <p className="font-bold text-slate-700">{dormFee?.electricityFee.toLocaleString()} đ</p>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-lg text-indigo-500 shadow-sm">
                                                <span className="material-symbols-outlined text-[20px]">wifi</span>
                                            </div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Wifi</p>
                                        </div>
                                        <p className="font-bold text-slate-700">{dormFee?.wifiFee.toLocaleString()} đ</p>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-lg text-emerald-500 shadow-sm">
                                                <span className="material-symbols-outlined text-[20px]">cleaning_services</span>
                                            </div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Vệ sinh</p>
                                        </div>
                                        <p className="font-bold text-slate-700">{dormFee?.cleaningFee.toLocaleString()} đ</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>


                {/* Rooms List Section */}
                <div className="lg:col-span-8">
                    {!isNew ? (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-slate-800">Cấu trúc phòng ({rooms.length})</h3>
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
                                                    <p className="font-bold text-slate-700">{room.name}</p>
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
