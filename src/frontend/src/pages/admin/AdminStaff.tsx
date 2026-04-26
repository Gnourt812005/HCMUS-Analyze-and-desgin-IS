import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '../../api/ApiClient';
import { UserProfileDTO, UserRole } from '@dormarch/shared';
import { motion } from 'framer-motion';

export const AdminStaff = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState<UserProfileDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await ApiClient.get<{ data: UserProfileDTO[] }>(
                `/users/staff${searchQuery ? `?keyword=${searchQuery}` : ''}`
            );
            setStaff(res.data);
        } catch (error) {
            console.error('Failed to fetch staff', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStaff();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleDelete = async (email: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${email}?`)) return;
        try {
            await ApiClient.delete(`/users/staff/${email}`);
            fetchStaff();
        } catch (error) {
            alert('Lỗi khi xóa nhân viên');
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case UserRole.ADMIN: return 'bg-purple-100 text-purple-700 border-purple-200';
            case UserRole.MANAGER: return 'bg-blue-100 text-blue-700 border-blue-200';
            case UserRole.SALE_STAFF: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getRoleName = (role: string) => {
        switch (role) {
            case UserRole.ADMIN: return 'Quản trị viên';
            case UserRole.MANAGER: return 'Quản lý cơ sở';
            case UserRole.SALE_STAFF: return 'Nhân viên kinh doanh';
            default: return role;
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quản lý nhân viên</h1>
                    <p className="text-slate-500 mt-1">Danh sách nhân sự thuộc hệ thống</p>
                </div>
                <button
                    onClick={() => navigate('/admin/staff/new')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-blue-200 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Thêm nhân viên mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase font-bold tracking-widest border-b border-slate-100">
                                <th className="px-8 py-4">Nhân viên</th>
                                <th className="px-8 py-4">Số điện thoại</th>
                                <th className="px-8 py-4">Vai trò</th>
                                <th className="px-8 py-4">Địa chỉ</th>
                                <th className="px-8 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6 h-20 bg-slate-50/30"></td>
                                    </tr>
                                ))
                            ) : staff.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                                        Không tìm thấy nhân viên nào phù hợp
                                    </td>
                                </tr>
                            ) : (
                                staff.map((member) => (
                                    <tr key={member.email} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                                    {member.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{member.fullName}</p>
                                                    <p className="text-xs text-slate-400 font-medium">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-semibold text-slate-600">{member.phone || '--'}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getRoleColor(member.role)}`}>
                                                {getRoleName(member.role)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm text-slate-500 line-clamp-1 max-w-[200px]">{member.address || '--'}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/staff/${member.email}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member.email)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
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
        </div>
    );
};
