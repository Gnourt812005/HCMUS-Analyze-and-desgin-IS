import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { Favourites } from '../business/Favourites';

export const favouriteRoutes = Router();

// GET /api/favourites
favouriteRoutes.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: 'Unauthorized' });

    const { code, data } = await Favourites.getFavouritesByUserId(email);

    if (code === 0) {
        res.json({ message: 'Success', status: 200, data });
    } else {
        res.status(500).json({ message: 'Lỗi server' });
    }
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

        const result = await Favourites.addFavourite(email, roomId);
        if (result === 0) {
            res.json({ message: 'Đã thêm vào mục yêu thích', status: 200 });
        } else if (result === 1) {
            res.status(400).json({ message: 'Phòng đã nằm trong danh sách yêu thích' });
        } else {
            res.status(500).json({ message: 'Lỗi server' });
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

        const result = await Favourites.deleteFavourite(email, roomId);
        if (result === 0) {
            res.json({ message: 'Đã xóa khỏi mục yêu thích', status: 200 });
        } else if (result === 1) {
            res.status(400).json({ message: 'Phòng không nằm trong danh sách yêu thích' });
        } else {
            res.status(500).json({ message: 'Lỗi server' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
