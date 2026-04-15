import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { dorms, rooms } from "../data/mockData";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";
import RoomCard from "./RoomCard";
import RoomDetailModal from "./RoomDetailModal";
import Header from "./Header";

interface FilterState {
  priceRange: [number, number];
  block: string;
  availableBeds: number | null;
  totalBeds: number | null;
}

export default function RoomList() {
  const { dormId } = useParams();
  const navigate = useNavigate();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 3000000],
    block: "",
    availableBeds: null,
    totalBeds: null,
  });
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  const dorm = dorms.find((d) => d.id === dormId);
  const dormRooms = rooms.filter((r) => r.dormId === dormId);

  const blocks = useMemo(() => {
    const uniqueBlocks = new Set(dormRooms.map((r) => r.block));
    return Array.from(uniqueBlocks);
  }, [dormRooms]);

  const filteredRooms = useMemo(() => {
    return dormRooms.filter((room) => {
      const priceMatch =
        room.price >= filters.priceRange[0] &&
        room.price <= filters.priceRange[1];
      const blockMatch = !filters.block || room.block === filters.block;
      const availableBedsMatch =
        filters.availableBeds === null ||
        room.availableBeds >= filters.availableBeds;
      const totalBedsMatch =
        filters.totalBeds === null || room.totalBeds === filters.totalBeds;

      return priceMatch && blockMatch && availableBedsMatch && totalBedsMatch;
    });
  }, [dormRooms, filters]);

  if (!dorm) {
    return <div>Không tìm thấy ký túc xá</div>;
  }

  const selectedRoom = dormRooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="relative min-h-screen bg-neutral-50">
      <Header />
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-neutral-600 transition-colors hover:text-neutral-900"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Quay lại</span>
            </button>
            <div className="text-center">
              <h2 className="text-lg">{dorm.name}</h2>
              <p className="text-sm text-neutral-600">{dorm.address}</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 transition-colors hover:bg-neutral-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden rounded-lg border border-neutral-200 bg-white p-6"
          >
            <h3 className="mb-6">Lọc phòng</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm">
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
                        priceRange: [
                          parseInt(e.target.value),
                          tempFilters.priceRange[1],
                        ],
                      })
                    }
                    className="w-full"
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
                        priceRange: [
                          tempFilters.priceRange[0],
                          parseInt(e.target.value),
                        ],
                      })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>{tempFilters.priceRange[0].toLocaleString()}</span>
                    <span>{tempFilters.priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm">Vị trí/Block</label>
                <select
                  value={tempFilters.block}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, block: e.target.value })
                  }
                  className="w-full rounded-lg border border-neutral-300 px-4 py-2"
                >
                  <option value="">Tất cả</option>
                  {blocks.map((block) => (
                    <option key={block} value={block}>
                      {block}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm">Số giường còn trống (tối thiểu)</label>
                <input
                  type="number"
                  min="0"
                  value={tempFilters.availableBeds ?? ""}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      availableBeds: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Bất kỳ"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">Số giường trong phòng</label>
                <select
                  value={tempFilters.totalBeds ?? ""}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      totalBeds: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-lg border border-neutral-300 px-4 py-2"
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
                className="rounded-lg border border-neutral-300 px-6 py-2 transition-colors hover:bg-neutral-50"
              >
                Đặt lại
              </button>
              <button
                onClick={() => {
                  setFilters(tempFilters);
                  setShowFilters(false);
                }}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Áp dụng
              </button>
            </div>
          </motion.div>
        )}

        <div className="mb-4 text-neutral-600">
          Tìm thấy {filteredRooms.length} phòng
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room, index) => (
            <RoomCard
              key={room.id}
              room={room}
              index={index}
              onClick={() => setSelectedRoomId(room.id)}
            />
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="py-20 text-center text-neutral-500">
            Không tìm thấy phòng phù hợp với bộ lọc
          </div>
        )}
      </div>

      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          dorm={dorm}
          onClose={() => setSelectedRoomId(null)}
        />
      )}
    </div>
  );
}
