import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ApiClient } from '../api/ApiClient';

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

export const CustomerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ApiClient.get<{ status: number, data: Order[] }>('/rentals/orders/my');
        if (response.status === 200) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 className="h-3 w-3" /> Đã thanh toán
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-bold">
            <Clock className="h-3 w-3" /> Chờ thanh toán
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Package className="h-8 w-8 text-blue-600" /> Lịch sử đơn hàng
        </h1>
        <p className="text-slate-600 mt-2">Xem danh sách các đơn đăng ký thuê và đặt cọc của bạn.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-slate-500 mb-6">Bạn chưa thực hiện đăng ký thuê phòng nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      order.type === 'DEPOSIT' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.type === 'DEPOSIT' ? 'Đặt cọc' : 'Thuê phòng'}
                    </span>
                    <span className="text-slate-400 text-xs font-medium">#{order.id.slice(0, 8)}</span>
                    {getStatusBadge(order.paymentStatus)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {order.dormName} - Phòng {order.roomName}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Giường: <span className="font-semibold text-slate-700">{order.bedNumbers.join(', ')}</span>
                  </p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <Calendar className="h-3 w-3" />
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="text-xl font-black text-blue-600">
                    {order.totalAmount.toLocaleString('vi-VN')} VND
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
