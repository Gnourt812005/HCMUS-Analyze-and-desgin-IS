import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, DollarSign, Bed, Users, Building2, MapPin, CheckCircle2, AlertCircle, Heart, X } from "lucide-react";
import { RoomBriefDTO, RoomDetailDTO } from "@dormarch/shared";
import { ApiClient } from "../api/ApiClient";
import { AuthService } from "../api/AuthService";
import { Room } from "./RoomList"; // Reuse the Room interface from RoomList for consistency

const roomImages: Record<string, string> = {
  "bedroom-1": "https://images.unsplash.com/photo-1553172366-55b235a466f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-2": "https://images.unsplash.com/photo-1609363650758-e4b1400add8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-3": "https://images.unsplash.com/photo-1579632151052-92f741fb9b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-4": "https://images.unsplash.com/photo-1694151569569-8288e3118519?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-5": "https://images.unsplash.com/flagged/photo-1582108074095-1730ef6caec9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "bedroom-6": "https://images.unsplash.com/photo-1570570665905-346e1b6be193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
};

export const FavouriteManagement = () => {
    const navigate = useNavigate();
    
    const [originalRooms, setOriginalRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    
    // Preview form state
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewDate, setPreviewDate] = useState("");
    const [previewTime, setPreviewTime] = useState("");
    const [previewSuccess, setPreviewSuccess] = useState(false);
    const [previewError, setPreviewError] = useState("");

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                if (!AuthService.isLoggedIn()) {
                    navigate("/login");
                    return;
                }
                const response = await ApiClient.get<{ status: number, data: Room[] }>(`/favourites`);
                
                if (response.status === 200) {
                    setOriginalRooms(response.data.map(r => ({...r, isFavorite: true})));
                }
            } catch (error) {
                console.error("Failed to fetch rooms", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [navigate]);

    const displayRooms: RoomBriefDTO[] = originalRooms.map(room => ({
        id: room.id,
        name: room.name,
        block: room.block,
        price: room.price,
        totalBeds: room.totalBeds,
        availableBeds: room.availableBeds,
        amenities: room.amenities,
        imageUrl: room.imageUrl,
    }));

    const selectedRoomData = originalRooms.find(r => r.id === selectedRoomId);
    
    let selectedRoomDetail: RoomDetailDTO | null = null;
    if (selectedRoomData) {
        selectedRoomDetail = {
            id: selectedRoomData.id,
            dormId: selectedRoomData.dormId,
            name: selectedRoomData.name,
            block: selectedRoomData.block,
            floor: selectedRoomData.floor,
            price: selectedRoomData.price,
            totalBeds: selectedRoomData.totalBeds,
            availableBeds: selectedRoomData.availableBeds,
            amenities: selectedRoomData.amenities,
            isFavorite: selectedRoomData.isFavorite,
            // specialNotes: selectedRoomData.specialNotes,
            imageUrl: selectedRoomData.imageUrl,
            favoriteCount: selectedRoomData.favoriteCount,
        };
    }

    const handleToggleFavorite = async (roomId: string) => {
        if (!AuthService.isLoggedIn()) {
            navigate("/login");
            return;
        }

        // Optimistically remove it from UI
        setOriginalRooms(prevRooms => prevRooms.filter(r => r.id !== roomId));
        if (selectedRoomId === roomId) {
            setSelectedRoomId(null);
        }

        try {
            await ApiClient.delete(`/favourites/${roomId}`);
        } catch (error) {
            console.error("Failed to un-favorite room", error);
        }
    };

    const handleRegisterViewing = () => {
        if (!AuthService.isLoggedIn()) {
            navigate("/login");
            return;
        }
        setShowPreviewModal(true);
        setPreviewSuccess(false);
        setPreviewError("");
        setPreviewDate("");
        setPreviewTime("");
    };

    const submitPreviewForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setPreviewError("");

        const selectedDateTime = new Date(`${previewDate}T${previewTime}`);
        const now = new Date();

        if (selectedDateTime <= now) {
            setPreviewError("Ngày và giờ xem phòng phải là thời điểm trong tương lai");
            return;
        }

        try {
            const user = AuthService.getUserInfo();
            const response = await ApiClient.post<{ status: number, message: string }>("/previews", {
                body: JSON.stringify({
                    roomId: selectedRoomId,
                    userId: user?.email || "unknown",
                    previewDatetime: selectedDateTime.toISOString()
                })
            });

            if (response.status === 200) {
                setPreviewSuccess(true);
                setTimeout(() => {
                    setShowPreviewModal(false);
                    setPreviewSuccess(false);
                }, 2000);
            }
        } catch (error: any) {
            setPreviewError(error.message || "Failed to book preview");
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 bg-white p-4 rounded-xl shadow-sm mb-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span>Quay lại</span>
                    </button>
                    <h2 className="text-lg font-semibold text-slate-800">Danh sách phòng yêu thích</h2>
                    <div className="w-24"></div>
                </div>
            </div>

            <div className="px-2">

                <div className="mb-4 text-slate-600 font-medium">
                    Tìm thấy {displayRooms.length} phòng
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {displayRooms.map((room, index) => {
                                const isAvailable = room.availableBeds > 0;
                                return (
                                    <motion.div
                                        key={room.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                        onClick={() => setSelectedRoomId(room.id)}
                                        className="group cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:shadow-lg"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                            <img
                                                src={roomImages[room.imageUrl] || roomImages["bedroom-1"]}
                                                alt={room.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            {!isAvailable && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <span className="rounded-full bg-red-600 px-4 py-2 font-medium text-white shadow-sm">
                                                        Hết chỗ
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 font-medium shadow-sm backdrop-blur-sm">
                                                <span className="text-sm text-slate-800">{room.block}</span>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="mb-3 flex items-start justify-between">
                                                <div>
                                                    <h3 className="mb-1 font-semibold text-slate-800">Phòng {room.name}</h3>
                                                    <div className="flex items-center gap-1 text-blue-600 font-medium">
                                                        <DollarSign className="h-4 w-4" />
                                                        <span className="text-lg">
                                                            {room.price.toLocaleString()} VNĐ
                                                        </span>
                                                        <span className="text-sm text-slate-500">/tháng</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 border-t border-slate-100 pt-3">
                                                <div className="flex items-center justify-between text-sm text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <Bed className="h-4 w-4" />
                                                        <span>Tổng giường:</span>
                                                    </div>
                                                    <span className="font-medium text-slate-800">{room.totalBeds}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Users className="h-4 w-4" />
                                                        <span>Còn trống:</span>
                                                    </div>
                                                    <span
                                                        className={`font-semibold ${
                                                            isAvailable ? "text-green-600" : "text-red-600"
                                                        }`}
                                                    >
                                                        {room.availableBeds}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {room.amenities.slice(0, 3).map((amenity: string) => (
                                                    <span
                                                        key={amenity}
                                                        className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                                                    >
                                                        {amenity}
                                                    </span>
                                                ))}
                                                {room.amenities.length > 3 && (
                                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                                        +{room.amenities.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        {displayRooms.length === 0 && (
                            <div className="py-20 text-center text-slate-500">
                                Không tìm thấy phòng yêu thích nào
                            </div>
                        )}
                    </>
                )}
            </div>

            <AnimatePresence>
                {selectedRoomDetail && selectedRoomData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedRoomId(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white shadow-2xl"
                        >
                            <button
                                onClick={() => setSelectedRoomId(null)}
                                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-slate-100 text-slate-700"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                                <img
                                    src={roomImages[selectedRoomDetail.imageUrl] || roomImages["bedroom-1"]}
                                    alt={selectedRoomDetail.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="p-6">
                                <div className="mb-6 flex items-start justify-between">
                                    <div>
                                        <h2 className="mb-2 text-2xl font-bold text-slate-800">Phòng {selectedRoomDetail.name}</h2>
                                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                                            <Building2 className="h-4 w-4 text-blue-600" />
                                            <span>Tòa {selectedRoomDetail.block} - Block {selectedRoomDetail.block}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="mb-1 text-2xl font-bold text-blue-600">
                                            {selectedRoomDetail.price.toLocaleString()} VNĐ
                                        </div>
                                        <div className="text-sm font-medium text-slate-500">/tháng</div>
                                    </div>
                                </div>

                                <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-6 md:grid-cols-4 border border-slate-100">
                                    <div className="text-center">
                                        <Bed className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                                        <div className="text-sm font-medium text-slate-500">Tổng giường</div>
                                        <div className="mt-1 font-bold text-slate-800 text-lg">{selectedRoomDetail.totalBeds}</div>
                                    </div>
                                    <div className="text-center">
                                        <Users className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                                        <div className="text-sm font-medium text-slate-500">Còn trống</div>
                                        <div
                                            className={`mt-1 font-bold text-lg ${
                                                selectedRoomDetail.availableBeds > 0 ? "text-green-600" : "text-red-600"
                                            }`}
                                        >
                                            {selectedRoomDetail.availableBeds}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <Building2 className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                                        <div className="text-sm font-medium text-slate-500">Vị trí</div>
                                        <div className="mt-1 font-bold text-slate-800 text-lg">{selectedRoomDetail.block}</div>
                                    </div>
                                    <div className="text-center">
                                        <MapPin className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                                        <div className="text-sm font-medium text-slate-500">Tầng</div>
                                        <div className="mt-1 font-bold text-slate-800 text-lg">Tầng {selectedRoomDetail.floor}</div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="mb-3 font-bold text-lg text-slate-800">Tiện ích</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRoomDetail.amenities.map((amenity) => (
                                            <div
                                                key={amenity}
                                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
                                            >
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                <span className="text-sm font-medium text-slate-700">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* 
                                {selectedRoomDetail.specialNotes.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="mb-3 font-bold text-lg text-slate-800">Lưu ý đặc biệt</h3>
                                        <div className="space-y-3">
                                            {selectedRoomDetail.specialNotes.map((note) => (
                                                <div
                                                    key={note}
                                                    className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 border border-blue-100"
                                                >
                                                    <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                                                    <span className="text-sm font-medium text-blue-900">{note}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                    */}

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            handleToggleFavorite(selectedRoomDetail!.id);
                                        }}
                                        className={`flex items-center gap-2 rounded-xl border-2 px-6 py-3 transition-all border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300`}
                                    >
                                        <Heart
                                            className={`h-5 w-5 transition-colors fill-red-600 text-red-600`}
                                        />
                                        <span className="font-semibold">Bỏ thích</span>
                                    </button>

                                    <button
                                        onClick={handleRegisterViewing}
                                        disabled={selectedRoomDetail.availableBeds === 0}
                                        className="flex-1 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                                    >
                                        {selectedRoomDetail.availableBeds === 0
                                            ? "Hết chỗ"
                                            : "Đăng ký xem phòng"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PREVIEW FORM MODAL */}
            <AnimatePresence>
                {showPreviewModal && selectedRoomDetail && (
                    previewSuccess ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-2xl"
                            >
                                <div className="mb-4 flex justify-center">
                                    <div className="rounded-full bg-green-100 p-4">
                                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 mb-2">Đăng ký thành công!</h2>
                                <p className="text-slate-600">
                                    Cảm ơn bạn đã đặt xem phòng {selectedRoomDetail.name}.
                                </p>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPreviewModal(false)}
                            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl"
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-slate-800">Đăng ký xem phòng</h2>
                                    <button
                                        onClick={() => setShowPreviewModal(false)}
                                        className="rounded-full p-2 transition-colors hover:bg-slate-100 text-slate-500"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="mb-6 rounded-lg bg-slate-50 p-4 border border-slate-100">
                                    <h3 className="mb-1 font-semibold text-slate-800">Phòng {selectedRoomDetail.name}</h3>
                                    <p className="text-sm text-slate-600">{selectedRoomDetail.block}</p>
                                </div>

                                <form onSubmit={submitPreviewForm} className="space-y-5">
                                    {previewError && (
                                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{previewError}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="date" className="mb-2 block text-sm font-medium text-slate-700">
                                            Ngày xem phòng
                                        </label>
                                        <input
                                            id="date"
                                            type="date"
                                            value={previewDate}
                                            onChange={(e) => setPreviewDate(e.target.value)}
                                            required
                                            min={new Date().toISOString().split("T")[0]}
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="time" className="mb-2 block text-sm font-medium text-slate-700">
                                            Giờ xem phòng
                                        </label>
                                        <input
                                            id="time"
                                            type="time"
                                            value={previewTime}
                                            onChange={(e) => setPreviewTime(e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
                                    >
                                        Xác nhận đăng ký
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )
                )}
            </AnimatePresence>
            </div>
        // </div>
    );
};