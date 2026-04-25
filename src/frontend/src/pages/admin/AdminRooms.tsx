import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '../../api/ApiClient';
import { RoomDTO, GetRoomDto, DormDTO } from '@dormarch/shared';
import { motion } from 'framer-motion';

export const AdminRooms = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<RoomDTO[]>([]);
    const [dorms, setDorms] = useState<DormDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    
    const [filters, setFilters] = useState<GetRoomDto>({
        page: 1,
        limit: 10,
        search: '',
        dormId: '',
        status: ''
    });

    const fetchDorms = async () => {
        try {
            const res = await ApiClient.get<{ data: { dorms: DormDTO[] } }>('/dorms?limit=100');
            setDorms(res.data.dorms);
        } catch (error) {
            console.error('Failed to fetch dorms', error);
        }
    };

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.page) queryParams.append('page', filters.page.toString());
            if (filters.limit) queryParams.append('limit', filters.limit.toString());
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.dormId) queryParams.append('dormId', filters.dormId);
            if (filters.status) queryParams.append('status', filters.status);

            const res = await ApiClient.get<{ data: { rooms: RoomDTO[], total: number } }>(`/rooms?${queryParams.toString()}`);
            setRooms(res.data.rooms);
            setTotal(res.data.total);
        } catch (error) {
            console.error('Failed to fetch rooms', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDorms();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRooms();
        }, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phòng này? Toàn bộ giường trong phòng cũng sẽ bị xóa.')) return;
        try {
            await ApiClient.delete(`/rooms/${id}`);
            fetchRooms();
        } catch (error) {
            alert('Lỗi khi xóa phòng');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'MAINTENANCE': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'FULL': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'Sẵn sàng';
            case 'MAINTENANCE': return 'Bảo trì';
            case 'FULL': return 'Đã đầy';
            default: return status;
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quản lý Phòng</h1>
                    <p className="text-slate-500 mt-1">Danh sách tất cả các phòng trong hệ thống</p>
                </div>
                <button
                    onClick={() => navigate('/admin/rooms/create')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-blue-200 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Thêm phòng mới
                </button>
            </div>

            {/* Filters Area */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Tìm theo tên phòng, khu vực..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                </div>
                
                <select 
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                    value={filters.dormId}
                    onChange={(e) => setFilters({ ...filters, dormId: e.target.value, page: 1 })}
                >
                    <option value="">Tất cả KTX</option>
                    {dorms.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>

                <select 
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="AVAILABLE">Sẵn sàng</option>
                    <option value="FULL">Đã đầy</option>
                    <option value="MAINTENANCE">Bảo trì</option>
                </select>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs uppercase font-bold text-slate-500 tracking-wider">Phòng</th>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-slate-500 tracking-wider">Thuộc KTX</th>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-slate-500 tracking-wider">Loại / Tầng</th>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-slate-500 tracking-wider text-center">Giường (Trống/Tổng)</th>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-slate-500 tracking-wider">Giá thấp nhất</th>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-slate-500 tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-slate-500 tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-4 h-16 bg-slate-50/20"></td>
                                    </tr>
                                ))
                            ) : rooms.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-slate-500 italic">
                                        Không tìm thấy phòng nào phù hợp
                                    </td>
                                </tr>
                            ) : (
                                rooms.map((room) => (
                                    <tr key={room.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {room.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{room.name}</p>
                                                    <p className="text-xs text-slate-400">ID: {room.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-700">
                                                {dorms.find(d => d.id === room.dormId)?.name || room.dormId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-medium text-slate-700">{room.block}</p>
                                                <p className="text-xs text-slate-500">Tầng {room.floor}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-sm font-bold">
                                                <span className="text-emerald-600">{room.availableBeds}</span>
                                                <span className="text-slate-400">/</span>
                                                <span className="text-slate-900">{room.totalBeds}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-900">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(room.status)}`}>
                                                {getStatusText(room.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/admin/rooms/${room.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Chi tiết / Quản lý giường"
                                                >
                                                    <span className="material-symbols-outlined text-xl">settings</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(room.id)}
                                                    className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                                    title="Xóa phòng"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && total > (filters.limit || 10) && (
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Hiển thị {(filters.page! - 1) * filters.limit! + 1} - {Math.min(filters.page! * filters.limit!, total)} trong tổng số {total} phòng
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={filters.page === 1}
                                onClick={() => setFilters({...filters, page: filters.page! - 1})}
                                className="p-1 rounded bg-white border border-slate-200 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <span className="text-sm font-bold px-2">Trang {filters.page}</span>
                            <button 
                                disabled={filters.page! * filters.limit! >= total}
                                onClick={() => setFilters({...filters, page: filters.page! + 1})}
                                className="p-1 rounded bg-white border border-slate-200 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
