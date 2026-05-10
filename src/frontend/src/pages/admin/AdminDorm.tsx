import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '../../api/ApiClient';
import { DormDTO } from '@dormarch/shared';
import { motion } from 'framer-motion';

export const AdminDorm = () => {
    const navigate = useNavigate();
    const [dorms, setDorms] = useState<DormDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [total, setTotal] = useState(0);

    const fetchDorms = async () => {
        try {
            setLoading(true);
            const res = await ApiClient.get<{ data: { dorms: DormDTO[], total: number } }>(
                `/admin/dorms?page=${page}&limit=${limit}${searchQuery ? `&keyword=${searchQuery}` : ''}`
            );
            setDorms(res.data.dorms);
            setTotal(res.data.total);
        } catch (error) {
            console.error('Failed to fetch dorms', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDorms();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, page]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa ký túc xá này?')) return;
        try {
            await ApiClient.delete(`/admin/dorms/${id}`);
            fetchDorms();
        } catch (error) {
            alert('Lỗi khi xóa ký túc xá');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Còn phòng': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Hết phòng': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'Sắp đầy': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Đã ẩn': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quản lý Ký túc xá</h1>
                    <p className="text-slate-500 mt-1">Xem và quản lý thông tin các cơ sở lưu trú</p>
                </div>
                <button
                    onClick={() => navigate('/admin/dorms/new')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-blue-200 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Thêm cơ sở mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List Area */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : dorms.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-300">apartment</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy kết quả</h3>
                    <p className="text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc thêm cơ sở mới.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dorms.map((dorm) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={dorm.id}
                            className="group bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden"
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div 
                                        onClick={() => navigate(`/admin/dorms/${dorm.id}`)}
                                        className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-2xl">apartment</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(dorm.status)}`}>
                                        {dorm.status}
                                    </div>
                                </div>

                                <div>
                                    <h3 
                                        onClick={() => navigate(`/admin/dorms/${dorm.id}`)}
                                        className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
                                    >
                                        {dorm.name}
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1 flex items-start gap-1">
                                        <span className="material-symbols-outlined text-[16px] mt-0.5">location_on</span>
                                        <span className="line-clamp-2">{dorm.address}</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                                    <div className="text-center">
                                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Tổng phòng</p>
                                        <p className="text-xl font-bold text-slate-900">{dorm.totalRooms}</p>
                                    </div>
                                    <div className="text-center border-l border-slate-100 px-2">
                                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Trống</p>
                                        <p className="text-xl font-bold text-emerald-600">{dorm.availableRooms}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <span className="material-symbols-outlined text-[18px]">phone</span>
                                            <span className="text-sm font-medium">{dorm.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400 mt-1">
                                            <span className="material-symbols-outlined text-[16px]">person</span>
                                            <span className="text-xs font-medium">QL: {dorm.managerId}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/dorms/${dorm.id}?edit=true`)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dorm.id)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination UI */}
            {!loading && (
                <div className="flex items-center justify-between bg-white px-8 py-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium">
                        Hiển thị <span className="text-slate-900 font-bold">{(page - 1) * limit + 1}</span> - <span className="text-slate-900 font-bold">{Math.min(page * limit, total)}</span> của <span className="text-slate-900 font-bold">{total}</span> cơ sở
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:hover:bg-white"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-400">Trang</span>
                            <span className="flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-xl bg-blue-50 text-blue-600 font-bold border border-blue-100">
                                {page}
                            </span>
                        </div>
                        <button
                            disabled={page * limit >= total}
                            onClick={() => setPage(page + 1)}
                            className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:hover:bg-white"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
