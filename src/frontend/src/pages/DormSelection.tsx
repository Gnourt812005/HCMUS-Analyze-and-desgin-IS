import { useEffect, useState } from "react";
import { motion } from "framer-motion"; // motion/react in mock but typically framer-mot
import { useNavigate } from "react-router-dom"; // react-router-dom in main app instead of react-router
import { Building2, Phone, MapPin, Bed } from "lucide-react";
import { DormSelectionDTO } from "@dormarch/shared";
import { ApiClient } from "../api/ApiClient";

// Required structure to hold backend return data
interface Dorm {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: "Còn phòng" | "Hết phòng" | "Sắp đầy";
  totalRooms: number;
  availableRooms: number;
}

export const DormSelection = () => {
    const navigate = useNavigate();
    const [dorms, setDorms] = useState<Dorm[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDorms = async () => {
            try {
                // Fetch dorms' data from the backend via api
                const res = await ApiClient.get<{ status: number; data: Dorm[] }>('/dorms');
                
                if (res.status === 200) {
                    // store all of that information into interface Dorm
                    setDorms(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch dorms", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDorms();
    }, []);

    const handleSelectDorm = (dormId: string) => {
        navigate(`/dorm/${dormId}/rooms`);
    };

    // use DormSelectionDTO to display to the screen
    const displayDorms: DormSelectionDTO[] = dorms.map(dorm => ({
        id: dorm.id,
        name: dorm.name,
        address: dorm.address,
        phone: dorm.phone,
        status: dorm.status,
        totalRooms: dorm.totalRooms,
        availableRooms: dorm.availableRooms,
    }));

    return (
        <div className="relative min-h-screen bg-slate-50 flex-grow">
            <div className="mx-auto max-w-7xl px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <h1 className="mb-4 text-3xl font-bold text-slate-800">Hệ thống ký túc xá</h1>
                    <p className="text-slate-600">
                        Chọn ký túc xá để xem danh sách phòng có sẵn
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {displayDorms.map((dorm, index) => (
                            <motion.div
                                key={dorm.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group relative"
                            >
                                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-lg">
                                    <div className="p-6">
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                                                    <Building2 className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 font-semibold text-lg text-slate-800">{dorm.name}</h3>
                                                    <span
                                                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                                                            dorm.status === "Còn phòng"
                                                                ? "bg-green-50 text-green-700"
                                                                : dorm.status === "Sắp đầy"
                                                                    ? "bg-yellow-50 text-yellow-700"
                                                                    : "bg-red-50 text-red-700"
                                                        }`}
                                                    >
                                                        {dorm.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2 text-slate-600">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                                <span className="text-sm">{dorm.address}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Phone className="h-4 w-4 shrink-0" />
                                                <span className="text-sm">{dorm.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Bed className="h-4 w-4 shrink-0" />
                                                <span className="text-sm">
                                                    {dorm.availableRooms}/{dorm.totalRooms} phòng còn trống
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 p-4">
                                        <button
                                            onClick={() => handleSelectDorm(dorm.id)}
                                            disabled={dorm.status === "Hết phòng"}
                                            className="w-full rounded-lg border-2 border-red-500 bg-white px-6 py-3 font-semibold text-red-500 transition-all hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white"
                                        >
                                            {dorm.status === "Hết phòng" ? "Hết phòng" : "Select"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};