import { Router } from 'express';
import { RoomDB } from '../database/RoomDB';
import { DormDB } from '../database/DormDB';
import { FavouriteRoomsDB } from '../database/FavouriteRoomsDB';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { RoomBriefDTO, RoomDetailDTO } from '@dormarch/shared';

export const favouriteRoutes = Router();

// GET /api/favourites
favouriteRoutes.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: 'Unauthorized' });

    // Find favorited room IDs
    const roomIds = await FavouriteRoomsDB.getRoomIdsByUserId(email);
    
    // Get all rooms and dorms
    const rooms = await RoomDB.fetchAll({});
    const dorms = await DormDB.getAll();
    const r = rooms.rooms;

    // Filter relevant rooms
    const favoritedRooms = r.filter(r => roomIds.includes(r.id!));

    // Map to full detailed structure mimicking RoomList.tsx needs
    const data = favoritedRooms.map(r => {
        const dormMatch = dorms.find(d => d.id === r.dormId);
        return {
            ...r,
            dormName: dormMatch?.name || 'Không xác định',
            dormAddress: dormMatch?.address || 'Không có địa chỉ'
        };
    });

    res.json({ message: 'Success', status: 200, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/favourites/:roomId
favouriteRoutes.post('/:roomId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { roomId } = req.params;
        const email = req.user?.email;

        if (!email) return res.status(401).json({ message: 'Unauthorized' });

        const inserted = await FavouriteRoomsDB.insert(email, roomId);
        if (inserted) {
            res.json({ message: 'Đã thêm vào mục yêu thích', status: 200 });
        } else {
            res.status(400).json({ message: 'Phòng đã có trong danh sách yêu thích' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// DELETE /api/favourites/:roomId
favouriteRoutes.delete('/:roomId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { roomId } = req.params;
        const email = req.user?.email;

        if (!email) return res.status(401).json({ message: 'Unauthorized' });

        const deleted = await FavouriteRoomsDB.delete(email, roomId);
        if (deleted) {
            res.json({ message: 'Đã xóa khỏi mục yêu thích', status: 200 });
        } else {
            res.status(400).json({ message: 'Phòng không nằm trong danh sách yêu thích' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
