

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiClient } from '../api/ApiClient';

interface RoomOption {
    roomId: string;
    bedId: string;
    title: string;
    price: number;
    available: number;
}

export const RoomList = () => {
    const navigate = useNavigate();
    const { dormid } = useParams();
    const [rooms, setRooms] = useState<RoomOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRooms = async () => {
            if (!dormid) {
                setRooms([]);
                setLoading(false);
                return;
            }

            try {
                const response = await ApiClient.get<{ status: number; data: RoomOption[] }>(`/dorms/${dormid}/rooms`);
                if (response.status === 200) {
                    setRooms(response.data);
                }
            } catch (error: any) {
                alert(error.message || 'Không tải được danh sách phòng.');
            } finally {
                setLoading(false);
            }
        };

        loadRooms();
    }, [dormid]);

    return (
        <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Danh sách phòng</h1>
                <p className="mt-2 text-slate-600">Ký túc xá {dormid}. Chọn phòng và giường để bắt đầu đăng ký thuê.</p>
            </div>

            {loading && (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">Đang tải danh sách phòng...</div>
            )}

            {!loading && rooms.length === 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center text-amber-900">Hiện chưa có phòng khả dụng cho ký túc xá này.</div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {rooms.map((room) => (
                    <article key={`${room.roomId}-${room.bedId}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800">{room.title}</h2>
                        <p className="mt-1 text-sm text-slate-600">Giá tháng: {room.price.toLocaleString('vi-VN')} VND</p>
                        <p className="mt-1 text-sm text-slate-600">Tình trạng: {room.available > 0 ? 'Còn trống' : 'Hết chỗ'}</p>
                        <button
                            disabled={room.available === 0}
                            onClick={() => navigate(`/rental/conditions?roomId=${room.roomId}&bedId=${room.bedId}`)}
                            className="mt-4 rounded-lg border-2 border-red-500 bg-white px-5 py-2 font-semibold text-red-500 transition-all hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white"
                        >
                            {room.available > 0 ? 'Đăng ký thuê' : 'Hết chỗ'}
                        </button>
                    </article>
                ))}
            </div>
        </div>
    );
};