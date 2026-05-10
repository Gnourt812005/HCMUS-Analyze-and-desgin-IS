import { useEffect, useState } from 'react';
import { Package, Calendar, User, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ApiClient } from '../../api/ApiClient';

interface Order {
  id: string;
  userEmail: string;
  dormName: string;
  roomName: string;
  bedNumbers: string[];
  totalAmount: number;
  type: 'DEPOSIT' | 'FULL';
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  createdAt: string;
}

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ApiClient.get<{ status: number, data: Order[] }>('/admin/rentals/orders/all');
        if (response.status === 200) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch all orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = (orders || []).filter(order => 
    (order.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (order.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (order.dormName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (order.roomName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 className="h-3 w-3" /> Thành công
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-bold">
            <Clock className="h-3 w-3" /> Chờ xử lý
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold">
            <AlertCircle className="h-3 w-3" /> Thất bại
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-full text-xs font-bold">
            <Clock className="h-3 w-3" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" /> Quản lý Đơn hàng
          </h1>
          <p className="text-slate-600 mt-2">Tổng cộng {orders.length} đơn hàng trong hệ thống.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm email, ID, phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin đơn</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vị trí</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Giá trị</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">#{order.id?.slice(0, 8) || 'N/A'}</span>
                        <span className={`text-[10px] font-black uppercase mt-1 w-fit px-1.5 py-0.5 rounded ${
                          order.type === 'DEPOSIT' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.type === 'DEPOSIT' ? 'Đặt cọc' : 'Thuê phòng'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <span className="text-sm text-slate-600 font-medium">{order.userEmail || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{order.dormName || 'Unknown Dorm'}</span>
                        <span className="text-xs text-slate-500">Phòng {order.roomName || '?'} - Giường {order.bedNumbers?.join(', ') || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-blue-600">
                        {(order.totalAmount || 0).toLocaleString('vi-VN')} VND
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Không tìm thấy đơn hàng nào khớp với tìm kiếm.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
