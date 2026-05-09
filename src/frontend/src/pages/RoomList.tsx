import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, SlidersHorizontal, DollarSign, Bed, Users, Building2, MapPin, CheckCircle2, AlertCircle, Heart, X } from "lucide-react";
import { BedOptionDTO, RoomBriefDTO, RoomDetailDTO } from "@dormarch/shared";
import { ApiClient } from "../api/ApiClient";
import { AuthService } from "../api/AuthService";
import { RentalService } from "../api/RentalService";

export interface Room {
    id: string;
    dormId: string;
    name: string;
    block: string;
    floor: number;
    price: number;
    totalBeds: number;
    availableBeds: number;
    amenities: string[];
    specialNotes: string[];
    imageUrl: string;
    favoriteCount: number;
    isFavorite: boolean;
    hasUserDeposit?: boolean;
    userRegistrationId?: string;
}
interface FilterState {
    priceRange: [number, number];
    block: string;
    availableBeds: number | null;
    totalBeds: number | null;
}

const roomImages: Record<string, string> = {
    "bedroom-1": "https://images.unsplash.com/photo-1553172366-55b235a466f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "bedroom-2": "https://images.unsplash.com/photo-1609363650758-e4b1400add8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "bedroom-3": "https://images.unsplash.com/photo-1579632151052-92f741fb9b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "bedroom-4": "https://images.unsplash.com/photo-1694151569569-8288e3118519?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "bedroom-5": "https://images.unsplash.com/flagged/photo-1582108074095-1730ef6caec9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "bedroom-6": "https://images.unsplash.com/photo-1570570665905-346e1b6be193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxkb3JtJTIwcm9vbSUyMGJlZHJvb218ZW58MXx8fHwxNzc1OTg2NDYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
};

export const RoomList = () => {
    const { dormid } = useParams();
    const dormId = dormid || "";
    const navigate = useNavigate();

    // Store all of that information into interfere Room
    const [originalRooms, setOriginalRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Preview form state
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showBedSelectionModal, setShowBedSelectionModal] = useState(false);
    const [previewDate, setPreviewDate] = useState("");
    const [previewTime, setPreviewTime] = useState("");
    const [previewSuccess, setPreviewSuccess] = useState(false);
    const [previewError, setPreviewError] = useState("");
    const [bedOptions, setBedOptions] = useState<BedOptionDTO[]>([]);
    const [selectedBedIds, setSelectedBedIds] = useState<string[]>([]);
    const [loadingBeds, setLoadingBeds] = useState(false);

    const [filters, setFilters] = useState<FilterState>({
        priceRange: [0, 3000000],
        block: "",
        availableBeds: null,
        totalBeds: null,
    });
    const [tempFilters, setTempFilters] = useState<FilterState>(filters);

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);
            try {
                let url = `/rooms?dormId=${dormId}`;

                // Get profile to get idCard if logged in
                let profileCccd = '';
                if (AuthService.isLoggedIn()) {
                    try {
                        const profileResponse = await ApiClient.get<any>('/users/profile');
                        profileCccd = profileResponse.cccd || '';
                        url += `&userIdCard=${profileCccd}`;
                    } catch (e) {
                        console.error("Failed to fetch profile", e);
                    }
                }

                const response = await ApiClient.get<{ status: number, data: { rooms: any[], total: number } }>(url);

                if (response.status === 200) {
                    let fetchedRooms = response.data.rooms.map((r: any) => ({ ...r, isFavorite: false }));

                    if (AuthService.isLoggedIn()) {
                        // Fetch the user's favorited items to identify `isFavorite`
                        const favResponse = await ApiClient.get<{ status: number, data: Room[] }>(`/favourites`);

                        if (favResponse.status === 200) {
                            const favoritedIds = new Set(favResponse.data.map((r: Room) => r.id));
                            fetchedRooms = fetchedRooms.map((room: Room) => ({
                                ...room,
                                isFavorite: favoritedIds.has(room.id)
                            }));
                        }
                    }
                    setOriginalRooms(fetchedRooms);
                }
            } catch (error) {
                console.error("Failed to fetch rooms", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [dormId]);

    const blocks = useMemo(() => {
        const uniqueBlocks = new Set(originalRooms.map((r) => r.block));
        return Array.from(uniqueBlocks);
    }, [originalRooms]);

    const filteredRooms = useMemo(() => {
        return originalRooms.filter((room) => {
            const priceMatch = room.price >= filters.priceRange[0] && room.price <= filters.priceRange[1];
            const blockMatch = !filters.block || room.block === filters.block;
            const availableBedsMatch = room.hasUserDeposit || filters.availableBeds === null || room.availableBeds >= filters.availableBeds;
            const totalBedsMatch = filters.totalBeds === null || room.totalBeds === filters.totalBeds;

            return priceMatch && blockMatch && availableBedsMatch && totalBedsMatch;
        });
    }, [originalRooms, filters]);

    // Use RoomBriefDTO to display to the screen list of rooms
    const displayRooms = filteredRooms.map(room => ({
        id: room.id,
        name: room.name,
        block: room.block,
        price: room.price,
        totalBeds: room.totalBeds,
        availableBeds: room.availableBeds,
        amenities: room.amenities,
        imageUrl: room.imageUrl,
        hasUserDeposit: room.hasUserDeposit, // New field
        userRegistrationId: room.userRegistrationId
    }));

    const selectedRoomData = originalRooms.find(r => r.id === selectedRoomId);

    // When a room is clicked on, use RoomDetailDTO to view its details
    let selectedRoomDetail: any = null;
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
            // specialNotes: selectedRoomData.specialNotes,
            imageUrl: selectedRoomData.imageUrl,
            favoriteCount: selectedRoomData.favoriteCount || 0,
            isFavorite: selectedRoomData.isFavorite || false,
            hasUserDeposit: selectedRoomData.hasUserDeposit, // New field
            userRegistrationId: selectedRoomData.userRegistrationId
        };
    }

    const handleToggleFavorite = async (roomId: string, currentCount: number, increment: boolean) => {
        if (!AuthService.isLoggedIn()) {
            navigate("/login");
            return;
        }

        // Optimistically update UI
        setOriginalRooms(prevRooms => prevRooms.map(r => {
            if (r.id === roomId) {
                const count = r.favoriteCount || 0;
                return { ...r, favoriteCount: increment ? count + 1 : Math.max(0, count - 1), isFavorite: increment };
            }
            return r;
        }));

        try {
            if (increment) {
                await ApiClient.post(`/favourites/${roomId}`);
            } else {
                await ApiClient.delete(`/favourites/${roomId}`);
            }
        } catch (error) {
            console.error("Failed to toggle favorite", error);
            // Revert on error
            setOriginalRooms(prevRooms => prevRooms.map(r => {
                if (r.id === roomId) {
                    return { ...r, favoriteCount: currentCount || 0, isFavorite: !increment };
                }
                return r;
            }));
        }
    };

    const handleRegisterViewing = () => {
        if (!AuthService.isLoggedIn()) {
            navigate("/login");
            return;
        }

        // Open the preview form modal
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
            const response = await ApiClient.post<{ status: number; message: string }>("/previews", {
                body: JSON.stringify({
                    roomId: selectedRoomId,
                    userId: user?.email || "unknown", // in real app, might use user.id
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

    const handleRegisterRental = async () => {
        if (!selectedRoomDetail) return;

        // NEW: If user already deposited, skip bed selection and go to payment
        if (selectedRoomDetail.hasUserDeposit && selectedRoomDetail.userRegistrationId) {
            setLoadingBeds(true);
            try {
                const previewResponse = await RentalService.preview({
                    registrationId: selectedRoomDetail.userRegistrationId,
                    action: 'FULL_PAYMENT'
                });

                if (previewResponse.status === 200) {
                    navigate('/rental/payment', {
                        state: {
                            registrationId: selectedRoomDetail.userRegistrationId,
                            action: 'FULL_PAYMENT',
                            defaultMethod: 'BANK',
                            preview: previewResponse.data
                        }
                    });
                }
                return;
            } catch (error: any) {
                console.error("Fast track failed:", error);
            } finally {
                setLoadingBeds(false);
            }
        }

        setLoadingBeds(true);
        setSelectedBedIds([]);
        try {
            const response = await ApiClient.get<{ status: number; data: BedOptionDTO[] }>(`/rooms/${selectedRoomDetail.id}/beds`);
            if (response.status === 200) {
                setBedOptions(response.data);
                setShowBedSelectionModal(true);
            }
        } catch (error: any) {
            alert(error.message || "Không tải được danh sách giường.");
        } finally {
            setLoadingBeds(false);
        }
    };

    const toggleBedSelection = (bedId: string) => {
        setSelectedBedIds((prev) =>
            prev.includes(bedId) ? prev.filter((id) => id !== bedId) : [...prev, bedId]
        );
    };

    const confirmBedSelection = () => {
        if (!selectedRoomDetail || selectedBedIds.length === 0) return;
        const encodedBedIds = encodeURIComponent(selectedBedIds.join(','));
        const selectedBeds = bedOptions.filter(b => selectedBedIds.includes(b.id));
        const bedNumbers = selectedBeds.map(b => b.bedNumber);

        navigate(`/rental/conditions?roomId=${selectedRoomDetail.id}&bedIds=${encodedBedIds}`, {
            state: {
                roomName: selectedRoomDetail.name,
                bedNumbers: bedNumbers,
                dormId: selectedRoomDetail.dormId
            }
        });
        setShowBedSelectionModal(false);
    };

    return (
        <div className="relative bg-slate-50 flex-grow -mt-24">
            <div className="sticky top-16 z-10 border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            <span>Quay lại</span>
                        </button>
                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-slate-800">Danh sách phòng {dormId && `- Ký túc xá`}</h2>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 transition-colors hover:bg-slate-50"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span>Bộ lọc</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8">
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <h3 className="mb-6 font-semibold text-slate-800">Lọc phòng</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Khoảng giá (VNĐ/tháng)
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="3000000"
                                            step="100000"
                                            value={tempFilters.priceRange[0]}
                                            onChange={(e) =>
                                                setTempFilters({
                                                    ...tempFilters,
                                                    priceRange: [parseInt(e.target.value), tempFilters.priceRange[1]],
                                                })
                                            }
                                            className="w-full accent-blue-600"
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="3000000"
                                            step="100000"
                                            value={tempFilters.priceRange[1]}
                                            onChange={(e) =>
                                                setTempFilters({
                                                    ...tempFilters,
                                                    priceRange: [tempFilters.priceRange[0], parseInt(e.target.value)],
                                                })
                                            }
                                            className="w-full accent-blue-600"
                                        />
                                        <div className="flex justify-between text-sm text-slate-600">
                                            <span>{tempFilters.priceRange[0].toLocaleString()}</span>
                                            <span>{tempFilters.priceRange[1].toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Vị trí/Block</label>
                                    <select
                                        value={tempFilters.block}
                                        onChange={(e) => setTempFilters({ ...tempFilters, block: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2 bg-white text-slate-700"
                                    >
                                        <option value="">Tất cả</option>
                                        {blocks.map((block) => (
                                            <option key={block} value={block}>{block}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Số giường trống (tối thiểu)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={tempFilters.availableBeds ?? ""}
                                        onChange={(e) =>
                                            setTempFilters({
                                                ...tempFilters,
                                                availableBeds: e.target.value ? parseInt(e.target.value) : null,
                                            })
                                        }
                                        placeholder="Bất kỳ"
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Số giường trong phòng</label>
                                    <select
                                        value={tempFilters.totalBeds ?? ""}
                                        onChange={(e) =>
                                            setTempFilters({
                                                ...tempFilters,
                                                totalBeds: e.target.value ? parseInt(e.target.value) : null,
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2 bg-white text-slate-700"
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="2">2 giường</option>
                                        <option value="3">3 giường</option>
                                        <option value="4">4 giường</option>
                                        <option value="6">6 giường</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        const resetFilters = {
                                            priceRange: [0, 3000000] as [number, number],
                                            block: "",
                                            availableBeds: null,
                                            totalBeds: null,
                                        };
                                        setTempFilters(resetFilters);
                                        setFilters(resetFilters);
                                    }}
                                    className="rounded-lg border border-slate-300 px-6 py-2 transition-colors hover:bg-slate-50 font-medium text-slate-700"
                                >
                                    Đặt lại
                                </button>
                                <button
                                    onClick={() => {
                                        setFilters(tempFilters);
                                        setShowFilters(false);
                                    }}
                                    className="rounded-lg bg-blue-600 px-6 py-2 text-white font-medium transition-colors hover:bg-blue-700"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                            {!isAvailable && !room.hasUserDeposit && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <span className="rounded-full bg-red-600 px-4 py-2 font-medium text-white shadow-sm">
                                                        Hết chỗ
                                                    </span>
                                                </div>
                                            )}
                                            {room.hasUserDeposit && (
                                                <div className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                                                    ĐÃ ĐẶT CỌC
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
                                                        className={`font-semibold ${isAvailable ? "text-green-600" : "text-red-600"
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
                                Không tìm thấy phòng phù hợp với bộ lọc
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
                                            <span>Block {selectedRoomDetail.block}</span>
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
                                            className={`mt-1 font-bold text-lg ${selectedRoomDetail.availableBeds > 0 ? "text-green-600" : "text-red-600"
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
                                        {selectedRoomDetail.amenities.map((amenity: string) => (
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

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            handleToggleFavorite(selectedRoomDetail!.id, selectedRoomDetail!.favoriteCount, !selectedRoomDetail!.isFavorite);
                                        }}
                                        className={`flex items-center gap-2 rounded-xl border-2 px-6 py-3 transition-all ${selectedRoomDetail!.isFavorite
                                                ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-500"
                                            }`}
                                    >
                                        <Heart
                                            className={`h-5 w-5 transition-colors ${selectedRoomDetail!.isFavorite ? "fill-red-600 text-red-600" : ""
                                                }`}
                                        />
                                        <span className="font-semibold">{selectedRoomDetail!.favoriteCount}</span>
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

                                    <button
                                        onClick={handleRegisterRental}
                                        disabled={selectedRoomDetail.availableBeds === 0 && !selectedRoomDetail.hasUserDeposit}
                                        className={`flex-1 rounded-xl px-6 py-3 font-semibold text-white shadow-sm transition-all shadow-md ${selectedRoomDetail.hasUserDeposit
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-blue-700 hover:bg-blue-800"
                                            } disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none`}
                                    >
                                        {selectedRoomDetail.hasUserDeposit
                                            ? "Tiếp tục thanh toán"
                                            : selectedRoomDetail.availableBeds === 0
                                                ? "Hết chỗ"
                                                : "Đăng ký thuê"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showBedSelectionModal && selectedRoomDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowBedSelectionModal(false)}
                        className="fixed inset-0 z-[75] flex items-center justify-center bg-black/50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800">Chọn giường để đăng ký thuê</h3>
                                <button
                                    onClick={() => setShowBedSelectionModal(false)}
                                    className="rounded-full p-2 transition-colors hover:bg-slate-100 text-slate-500"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <p className="mb-4 text-sm text-slate-600">Phòng {selectedRoomDetail.name} - chọn một hoặc nhiều giường còn trống.</p>

                            <div className="space-y-2 max-h-72 overflow-auto pr-1">
                                {bedOptions.map((bed) => {
                                    const isAvailable = bed.status === 'AVAILABLE';
                                    const isSelected = selectedBedIds.includes(bed.id);
                                    return (
                                        <label
                                            key={bed.id}
                                            className={`flex items-center justify-between rounded-lg border px-3 py-3 ${isAvailable ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-100'
                                                }`}
                                        >
                                            <span>
                                                <span className="block font-semibold text-slate-800">Giường {bed.bedNumber}</span>
                                                <span className="block text-xs text-slate-500">{bed.price.toLocaleString()} VNĐ/tháng</span>
                                            </span>
                                            <span className="flex items-center gap-3">
                                                <span className={`text-xs font-semibold ${isAvailable ? 'text-green-600' : 'text-slate-500'}`}>
                                                    {isAvailable ? 'Còn trống' : bed.status === 'DEPOSITED' ? 'Đã cọc' : 'Đã thuê'}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    disabled={!isAvailable}
                                                    onChange={() => toggleBedSelection(bed.id)}
                                                />
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowBedSelectionModal(false)}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmBedSelection}
                                    disabled={selectedBedIds.length === 0}
                                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
                                >
                                    Tiếp tục ({selectedBedIds.length} giường)
                                </button>
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
    );
};