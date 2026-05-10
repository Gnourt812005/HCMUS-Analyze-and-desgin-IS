import { useState, useEffect } from 'react';
import { ApiClient } from '../../api/ApiClient';
import { UtilityDTO, CreateUtilityDto } from '@dormarch/shared';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminUtilities = () => {
    const [utilities, setUtilities] = useState<UtilityDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<CreateUtilityDto>({
        title: '',
        type: 'ROOM',
        isLiable: false,
        incurredPrice: 0
    });

    const fetchUtilities = async () => {
        try {
            setLoading(true);
            const res = await ApiClient.get<{ data: { utilities: UtilityDTO[] } }>(
                `/admin/utilities?search=${searchQuery}`
            );
            setUtilities(res.data.utilities);
        } catch (error) {
            console.error('Failed to fetch utilities', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUtilities();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleOpenModal = (util?: UtilityDTO) => {
        if (util) {
            setEditingId(util.id);
            setFormData({
                title: util.title,
                type: util.type,
                isLiable: util.isLiable,
                incurredPrice: util.incurredPrice
            });
        } else {
            setEditingId(null);
            setFormData({
                title: '',
                type: 'ROOM',
                isLiable: false,
                incurredPrice: 0
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingId) {
                await ApiClient.put(`/admin/utilities/${editingId}`, {
                    body: JSON.stringify({ title: formData.title })
                });
            } else {
                await ApiClient.post('/admin/utilities', {
                    body: JSON.stringify(formData)
                });
            }
            setShowModal(false);
            fetchUtilities();
        } catch (error: any) {
            alert(error.message || 'Lỗi khi lưu tiện ích');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tiện ích này?')) return;
        try {
            await ApiClient.delete(`/admin/utilities/${id}`);
            fetchUtilities();
        } catch (error: any) {
            alert(error.message || 'Lỗi khi xóa tiện ích');
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'ROOM': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'DORM': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'BED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quản lý Tiện ích</h1>
                    <p className="text-slate-500 mt-1">Quản lý danh mục tiện ích cho phòng, cơ sở và giường</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-blue-200 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Thêm tiện ích mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tiện ích..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase font-bold tracking-widest">
                                <th className="px-8 py-4">Tên tiện ích</th>
                                <th className="px-8 py-4">Loại gán</th>
                                <th className="px-8 py-4">Trách nhiệm</th>
                                <th className="px-8 py-4 text-right">Phí phát sinh</th>
                                <th className="px-8 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6">
                                            <div className="h-6 bg-slate-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : utilities.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                                        Không tìm thấy tiện ích nào
                                    </td>
                                </tr>
                            ) : (
                                utilities.map((util) => (
                                    <tr key={util.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-700">{util.title}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getTypeColor(util.type)}`}>
                                                {util.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            {util.isLiable ? (
                                                <span className="text-rose-600 text-[11px] font-bold px-2 py-0.5 bg-rose-50 rounded border border-rose-100">CÓ TRÁCH NHIỆM</span>
                                            ) : (
                                                <span className="text-slate-400 text-[11px] font-medium italic">Không</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <p className="font-bold text-slate-900">{util.incurredPrice.toLocaleString()} đ</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(util)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <span className="material-symbols-outlined">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(util.id)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => !isSubmitting && setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">{editingId ? 'Chỉnh sửa tiện ích' : 'Thêm mới tiện ích'}</h3>
                                    <p className="text-slate-500 text-sm mt-1">Cung cấp thông tin chi tiết về tiện ích</p>
                                </div>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tên tiện ích</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        placeholder="VD: Điều hòa, WiFi, Máy nước nóng..."
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                {!editingId && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Loại gán cho</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['ROOM', 'DORM', 'BED'].map(t => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, type: t as any })}
                                                        className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                                            formData.type === t 
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                                                            : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer"
                                                        checked={formData.isLiable}
                                                        onChange={e => setFormData({...formData, isLiable: e.target.checked})}
                                                    />
                                                    <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Yêu cầu trách nhiệm bàn giao</span>
                                            </label>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phí phát sinh khi hư hỏng (đ)</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                                    value={formData.incurredPrice}
                                                    onChange={e => setFormData({ ...formData, incurredPrice: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {editingId && (
                                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                                        <div className="flex gap-3">
                                            <span className="material-symbols-outlined text-amber-600">info</span>
                                            <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                                Chỉ được phép thay đổi tên tiện ích khi chỉnh sửa để tránh làm sai lệch dữ liệu bàn giao đã tồn tại trong các hợp đồng.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
