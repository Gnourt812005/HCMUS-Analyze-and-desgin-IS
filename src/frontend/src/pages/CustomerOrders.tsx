import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Calendar, CreditCard, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { ApiClient } from '../api/ApiClient';
import { RentalService } from '../api/RentalService';

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
  hasFullPayment?: boolean;
}

export const CustomerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handlePayHire = async (order: Order) => {
    setProcessingId(order.id);
    try {
      const response = await RentalService.preview({
        registrationId: order.id,
        action: 'FULL_PAYMENT'
      });

      if (response.status === 200) {
        navigate('/rental/payment', {
          state: {
            registrationId: order.id,
            action: 'FULL_PAYMENT',
            defaultMethod: 'BANK',
            preview: response.data
          }
        });
      }
    } catch (error: any) {
      alert(error.message || 'Không thể chuẩn bị thanh toán.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
            <CheckCircle2 className="h-3 w-3" /> Đã thanh toán
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
            <Clock className="h-3 w-3" /> Chờ thanh toán
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
            <AlertCircle className="h-3 w-3" /> Thất bại
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
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
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      order.type === 'DEPOSIT' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.type === 'DEPOSIT' ? 'Đặt cọc' : 'Thuê phòng'}
                    </span>
                    <span className="text-slate-400 text-xs font-medium tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</span>
                    {getStatusBadge(order.paymentStatus)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {order.dormName} - Phòng {order.roomName}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Giường: <span className="font-semibold text-slate-700">{order.bedNumbers.join(', ')}</span>
                  </p>
                </div>

                <div className="flex flex-col md:items-end gap-4 min-w-[200px]">
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-1">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-xl font-black text-slate-900">
                      {order.totalAmount.toLocaleString('vi-VN')} <span className="text-xs font-bold text-slate-400">VND</span>
                    </div>
                  </div>

                  {order.type === 'DEPOSIT' && order.paymentStatus === 'SUCCESS' && !order.hasFullPayment && (
                    <button
                      onClick={() => handlePayHire(order)}
                      disabled={processingId === order.id}
                      className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:bg-slate-200 disabled:shadow-none"
                    >
                      {processingId === order.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <>
                          Thanh toán thuê phòng <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
