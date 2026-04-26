import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiClient } from '../../api/ApiClient';
import { UserDTO, UserRole } from '@dormarch/shared';
import { motion } from 'framer-motion';

export const AdminStaffDetail = () => {
    const { email } = useParams<{ email: string }>();
    const navigate = useNavigate();
    const isNew = email === 'new' || !email;

    const [loading, setLoading] = useState(!isNew);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState<UserDTO>({
        email: '',
        fullName: '',
        role: UserRole.SALE_STAFF,
        phone: '',
        address: '',
        cccd: '',
        gender: 'Nam',
        birthday: '',
        password: ''
    });

    useEffect(() => {
        if (!isNew) {
            fetchStaff();
        }
    }, [email]);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await ApiClient.get<{ data: UserDTO }>(`/users/staff/${email}`);
            setFormData(res.data);
        } catch (error) {
            console.error('Failed to fetch staff details', error);
            alert('Không tìm thấy thông tin nhân viên');
            navigate('/admin/staff');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await ApiClient.post('/users/staff', {
                body: JSON.stringify(formData)
            });
            alert(isNew ? 'Thêm nhân viên thành công' : 'Cập nhật thông tin thành công');
            navigate('/admin/staff');
        } catch (error: any) {
            alert(error.message || 'Lỗi khi lưu thông tin');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Action Bar */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/admin/staff')}
                    className="p-2 hover:bg-white rounded-full transition-colors text-slate-500 shadow-sm border border-slate-200"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {isNew ? 'Thêm nhân viên mới' : 'Chi tiết nhân viên'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isNew ? 'Nhập thông tin tài khoản nhân sự mới' : `Đang chỉnh sửa: ${email}`}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">Thông tin cá nhân</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email (Tài khoản)</label>
                            <input
                                required
                                type="email"
                                disabled={!isNew}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium disabled:opacity-50"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@example.com"
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Vai trò hệ thống</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium outline-none"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                            >
                                <option value={UserRole.SALE_STAFF}>Nhân viên kinh doanh</option>
                                <option value={UserRole.MANAGER}>Quản lý cơ sở</option>
                                <option value={UserRole.ADMIN}>Quản trị viên</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Họ và tên</label>
                            <input
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Số điện thoại</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Số CCCD</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                value={formData.cccd}
                                onChange={e => setFormData({ ...formData, cccd: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Giới tính</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium outline-none"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                             <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Ngày sinh</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                    value={formData.birthday}
                                    onChange={e => setFormData({ ...formData, birthday: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Địa chỉ thường trú</label>
                                <input
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        {isNew && (
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mật khẩu ban đầu</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Mặc định là 123456 nếu bỏ trống"
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/staff')}
                            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting}
                            type="submit"
                            className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Đang lưu...' : (isNew ? 'Thêm nhân viên' : 'Lưu thay đổi')}
                        </motion.button>
                    </div>
                </form>
            </div>
        </div>
    );
};
