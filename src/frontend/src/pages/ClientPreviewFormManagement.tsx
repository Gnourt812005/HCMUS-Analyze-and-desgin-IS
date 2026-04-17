import React, { useEffect, useState } from 'react';
import { ApiClient } from '../api/ApiClient';
import { PreviewBriefDTO, ClientPreviewDetailDTO } from '@dormarch/shared';

const PreviewDetailModal = ({ 
  previewId, 
  onClose 
}: { 
  previewId: string; 
  onClose: () => void; 
}) => {
  const [detail, setDetail] = useState<ClientPreviewDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [wantedDate, setWantedDate] = useState('');
  const [wantedTime, setWantedTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.get<{ message: string; data: ClientPreviewDetailDTO; status: number }>(`/previews/staff/${previewId}`);
      if (response.status === 200) {
        setDetail(response.data);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi nhận thông tin chi tiết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [previewId]);

  const handleReschedule = async () => {
    if (!wantedDate || !wantedTime) {
      alert('Vui lòng chọn ngày và giờ mới.');
      return;
    }

    if (detail?.date && detail?.time) {
      const currentDateTime = new Date(`${detail.date}T${detail.time}`);
      const newDateTime = new Date(`${wantedDate}T${wantedTime}`);
      if (newDateTime <= currentDateTime) {
        alert('Ngày và giờ dời lịch phải sau lúc hiện tại của đơn.');
        return;
      }
    }
    
    try {
      setRescheduleLoading(true);
      const response = await ApiClient.put<{ message: string; status: number }>(`/previews/staff/${previewId}/reschedule`, {
        body: JSON.stringify({
          currentPreviewDate: detail?.date,
          currentPreviewTime: detail?.time,
          wantedPreviewDate: wantedDate,
          wantedPreviewTime: wantedTime
        })
      });
      
      if (response.status === 200) {
        alert('Dời lịch thành công!');
        setIsRescheduling(false);
        fetchDetail(); // Refresh to get the new date/time
      } else {
        alert(response.message || 'Lỗi khi dời lịch');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi hệ thống');
    } finally {
      setRescheduleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
          </div>
          <p className="text-center mt-4 text-on-surface-variant">Đang tải chi tiết...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold text-error mb-4">Lỗi</h2>
          <p className="mb-6 text-on-surface-variant">{error || 'Không tìm thấy dữ liệu.'}</p>
          <button onClick={onClose} className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors">
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(detail.date).toLocaleDateString('vi-VN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-surface-container-lowest">
          <h2 className="text-xl font-bold text-on-surface">Chi tiết đơn phòng khách hàng</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-primary/5 p-4 rounded-xl space-y-3">
             <h3 className="font-semibold text-primary flex items-center gap-2 mb-2">
               <span className="material-symbols-outlined">apartment</span>
               Thông tin phòng
             </h3>
             <p className="flex justify-between"><span className="text-on-surface-variant">Ký túc xá:</span> <span className="font-medium">{detail.dormName}</span></p>
             <p className="flex justify-between"><span className="text-on-surface-variant">Phòng:</span> <span className="font-medium">{detail.roomName}</span></p>
             <p className="text-sm text-on-surface-variant mt-2 flex items-start gap-2">
               <span className="material-symbols-outlined text-[18px]">location_on</span>
               {detail.dormAddress}
             </p>
          </div>

          <div className="bg-secondary/5 p-4 rounded-xl space-y-3">
             <div className="flex items-center justify-between mb-2">
               <h3 className="font-semibold text-secondary flex items-center gap-2">
                 <span className="material-symbols-outlined">schedule</span>
                 Thời gian hẹn
               </h3>
               {!isRescheduling && (
                 <button 
                   onClick={() => setIsRescheduling(true)}
                   className="text-sm bg-secondary text-white px-3 py-1 rounded-lg hover:bg-secondary/90 transition-colors"
                 >
                   Dời lịch
                 </button>
               )}
             </div>
             
             {isRescheduling ? (
               <div className="space-y-4 pt-2 border-t border-secondary/20">
                 <div className="bg-white/50 p-3 rounded-lg border border-secondary/10 mb-4">
                   <p className="flex justify-between text-sm mb-1"><span className="text-on-surface-variant">Ngày hẹn hiện tại:</span> <span className="font-medium">{formattedDate}</span></p>
                   <p className="flex justify-between text-sm"><span className="text-on-surface-variant">Giờ hẹn hiện tại:</span> <span className="font-medium">{detail.time}</span></p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-on-surface mb-1">Ngày mong muốn</label>
                   <input 
                     type="date" 
                     className="w-full p-2 border border-outline-variant/50 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                     value={wantedDate}
                     onChange={e => setWantedDate(e.target.value)}
                     min={new Date().toISOString().split('T')[0]}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-on-surface mb-1">Giờ mong muốn</label>
                   <input 
                     type="time" 
                     className="w-full p-2 border border-outline-variant/50 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                     value={wantedTime}
                     onChange={e => setWantedTime(e.target.value)}
                   />
                 </div>
                 <div className="flex gap-2 justify-end pt-2">
                   <button 
                     onClick={() => setIsRescheduling(false)}
                     className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container py-2 rounded-lg transition-colors"
                     disabled={rescheduleLoading}
                   >
                     Hủy
                   </button>
                   <button 
                     onClick={handleReschedule}
                     disabled={rescheduleLoading}
                     className="px-4 py-2 text-sm font-medium bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2"
                   >
                     {rescheduleLoading ? <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span> : 'Xác nhận dời'}
                   </button>
                 </div>
               </div>
             ) : (
               <>
                 <p className="flex justify-between"><span className="text-on-surface-variant">Ngày xem:</span> <span className="font-medium">{formattedDate}</span></p>
                 <p className="flex justify-between"><span className="text-on-surface-variant">Giờ xem:</span> <span className="font-medium">{detail.time}</span></p>
               </>
             )}
          </div>

          <div className="bg-tertiary-container/20 p-4 rounded-xl space-y-3">
             <h3 className="font-semibold text-on-surface flex items-center gap-2 mb-2">
               <span className="material-symbols-outlined">person</span>
               Thông tin khách hàng
             </h3>
             <p className="flex justify-between"><span className="text-on-surface-variant">Họ & tên:</span> <span className="font-medium">{detail.customerInfo?.name || 'Không rõ'}</span></p>
             <p className="flex justify-between"><span className="text-on-surface-variant">Điện thoại:</span> <span className="font-medium">{detail.customerInfo?.phone || 'Không rõ'}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClientPreviewFormManagement = () => {
    const [forms, setForms] = useState<PreviewBriefDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                // Assuming we use /previews/staff for staff to get only forms assigned to them
                const res = await ApiClient.get<{ message: string; data: PreviewBriefDTO[]; status: number }>('/previews/staff');
                if (res.status === 200) {
                    setForms(res.data);
                } else {
                    setError(res.message);
                }
            } catch (err: any) {
                setError(err.message || 'Lỗi khi tải đơn phòng');
            } finally {
                setLoading(false);
            }
        };

        fetchForms();
    }, []);

    const formatStatus = (st: string) => {
        if (st === 'complete') return { label: 'Đã hoàn thành', class: 'bg-green-100 text-green-700' };
        if (st === 'canceled') return { label: 'Đã hủy', class: 'bg-red-100 text-red-700' };
        return { label: 'Đang xử lý', class: 'bg-blue-100 text-blue-700' };
    };

    return (
        <div className="min-h-[80vh] flex flex-col p-6 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary text-3xl">list_alt</span>
                <h1 className="text-2xl font-bold text-on-surface">Quản lý đơn phòng khách hàng</h1>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant space-y-4">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : error ? (
                <div className="bg-error/10 text-error p-6 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <p>{error}</p>
                </div>
            ) : forms.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-outline-variant/20 shadow-sm">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-primary text-4xl">event_busy</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-on-surface">Chưa có đơn phòng</h3>
                    <p className="text-on-surface-variant">Bạn chưa được phân công phụ trách đơn xem phòng nào.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {forms.map(form => {
                        const statusFormat = formatStatus(form.status);
                        return (
                            <div 
                                key={form.id} 
                                onClick={() => setSelectedFormId(form.id)}
                                className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="space-y-2 flex-grow">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors">{form.dormName}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusFormat.class}`}>
                                            {statusFormat.label}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                                            Phòng {form.roomName}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                            {new Date(form.previewDate).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                            {form.previewTime}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 md:mt-0 pt-4 md:pt-0 border-t border-outline-variant/10 md:border-t-0 md:pl-4 md:border-l">
                                    <span className="text-sm font-medium text-primary hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">Chi tiết</span>
                                    <span className="material-symbols-outlined text-primary">chevron_right</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {selectedFormId && (
                <PreviewDetailModal 
                    previewId={selectedFormId} 
                    onClose={() => setSelectedFormId(null)} 
                />
            )}
        </div>
    );
};