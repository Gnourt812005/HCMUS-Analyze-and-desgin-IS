import React, { useEffect, useState } from 'react';
import { ApiClient } from '../api/ApiClient';
import { PreviewBriefDTO, PreviewDetailDTO } from '@dormarch/shared';

// Modal component to view details of a preview form
const PreviewDetailModal = ({ 
  previewId, 
  onClose 
}: { 
  previewId: string; 
  onClose: () => void; 
}) => {
  const [detail, setDetail] = useState<PreviewDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await ApiClient.get<{ message: string; data: PreviewDetailDTO; status: number }>(`/previews/${previewId}`);
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
    fetchDetail();
  }, [previewId]);

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

  // Format date
  const formattedDate = new Date(detail.date).toLocaleDateString('vi-VN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-surface-container-lowest">
          <h2 className="text-xl font-bold text-on-surface">Chi tiết lịch xem phòng</h2>
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
             <h3 className="font-semibold text-secondary flex items-center gap-2 mb-2">
               <span className="material-symbols-outlined">schedule</span>
               Thời gian hẹn
             </h3>
             <p className="flex justify-between"><span className="text-on-surface-variant">Ngày xem:</span> <span className="font-medium">{formattedDate}</span></p>
             <p className="flex justify-between"><span className="text-on-surface-variant">Giờ xem:</span> <span className="font-medium">{detail.time}</span></p>
          </div>

          {detail.salesStaff ? (
             <div className="bg-tertiary/5 p-4 rounded-xl space-y-3">
               <h3 className="font-semibold text-tertiary flex items-center gap-2 mb-2">
                 <span className="material-symbols-outlined">support_agent</span>
                 Nhân viên phụ trách
               </h3>
               <p className="flex items-center gap-2"><span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span> <span className="font-medium">{detail.salesStaff.name}</span></p>
               <p className="flex items-center gap-2"><span className="material-symbols-outlined text-on-surface-variant text-[18px]">call</span> <span className="font-medium">{detail.salesStaff.phone}</span></p>
             </div>
          ) : (
             <div className="bg-surface-container p-4 rounded-xl">
               <p className="text-on-surface-variant text-center my-2 italic flex items-center justify-center gap-2">
                 <span className="material-symbols-outlined text-[18px]">pending_actions</span>
                 Chưa có nhân viên phụ trách
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PreviewFormManagement = () => {
    const [forms, setForms] = useState<PreviewBriefDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
    const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const res = await ApiClient.get<{ message: string; data: PreviewBriefDTO[]; status: number }>('/previews');
                if (res.status === 200) {
                    setForms(res.data);
                } else {
                    setError(res.message);
                }
            } catch (err: any) {
                setError(err.message || 'Lỗi khi tải lịch xem phòng');
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

    const handleCancel = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setCancelConfirmId(id);
    };

    const confirmCancel = async () => {
        if (!cancelConfirmId) return;
        try {
            const res = await ApiClient.put<{ message: string; status: number }>(`/previews/${cancelConfirmId}/cancel`);
            if (res.status === 200) {
                setForms(prev => prev.map(f => f.id === cancelConfirmId ? { ...f, status: 'canceled' } : f));
            } else {
                alert(res.message || 'Lỗi khi hủy lịch');
            }
        } catch (err: any) {
            alert(err.message || 'Lỗi khi hủy lịch');
        } finally {
            setCancelConfirmId(null);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col p-6 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary text-3xl">calendar_today</span>
                <h1 className="text-2xl font-bold text-on-surface">Quản lý lịch xem phòng</h1>
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
                    <h3 className="text-xl font-semibold mb-2 text-on-surface">Chưa có lịch hẹn</h3>
                    <p className="text-on-surface-variant">Bạn chưa đăng ký xem phòng nào. Hãy chọn phòng ưng ý và đặt lịch ngay!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <div className="text-on-surface-variant mb-2 font-medium">
                        Bạn có {forms.length} lịch xem phòng
                    </div>
                    {forms.map((form) => {
                        const statusInfo = formatStatus(form.status);
                        return (
                            <div 
                                key={form.id} 
                                onClick={() => setSelectedFormId(form.id)}
                                className="bg-white border border-outline-variant/20 rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                            >
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-lg text-on-surface">Phòng {form.roomName}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.class}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-on-surface-variant gap-2 mt-1">
                                        <span className="material-symbols-outlined text-[18px]">domain</span>
                                        {form.dormName}
                                    </div>
                                    <div className="flex items-center text-sm text-on-surface-variant gap-2 mt-1">
                                        <span className="material-symbols-outlined text-[18px]">map</span>
                                        <span className="line-clamp-1">{form.dormAddress}</span>
                                    </div>
                                </div>

                                <div className="border border-outline-variant/20 rounded-xl p-3 flex flex-col gap-2 min-w-[200px] items-end justify-center bg-surface-container-lowest">
                                    <div className="flex flex-col gap-2 flex-grow w-full">
                                        <div className="flex items-center gap-2 text-on-surface font-medium">
                                            <span className="material-symbols-outlined text-primary">calendar_month</span>
                                            {new Date(form.previewDate).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="flex items-center gap-2 text-on-surface font-medium">
                                            <span className="material-symbols-outlined text-primary">schedule</span>
                                            {form.previewTime}
                                        </div>
                                    </div>
                                    
                                    {form.status !== 'canceled' && form.status !== 'complete' && (
                                        <button 
                                            onClick={(e) => handleCancel(e, form.id)}
                                            className="mt-2 text-error hover:bg-error/10 px-4 py-1.5 rounded-lg border border-error text-sm font-medium transition-colors w-full"
                                        >
                                            Hủy lịch hẹn
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedFormId && (
                <PreviewDetailModal 
                    previewId={selectedFormId} 
                    onClose={() => setSelectedFormId(null)} 
                />
            )}

            {cancelConfirmId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setCancelConfirmId(null)}>
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
                                <span className="material-symbols-outlined text-4xl">warning</span>
                            </div>
                            <h2 className="text-xl font-bold text-on-surface">Hủy lịch xem phòng</h2>
                            <p className="text-on-surface-variant">Bạn có chắc chắn muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.</p>
                            
                            <div className="flex flex-row w-full gap-3 mt-6 pt-4">
                                <button 
                                    onClick={() => setCancelConfirmId(null)}
                                    className="flex-1 py-3 px-4 bg-surface-container hover:bg-surface-container-highest text-on-surface font-medium rounded-xl transition-colors"
                                >
                                    Đóng
                                </button>
                                <button 
                                    onClick={confirmCancel}
                                    className="flex-1 py-3 px-4 bg-error hover:bg-error/90 text-white font-medium rounded-xl transition-colors"
                                >
                                    Xác nhận hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};