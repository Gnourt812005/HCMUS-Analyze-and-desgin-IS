import { Router } from 'express';
import { RoomDB } from '../database/RoomDB';

export const roomRoutes = Router();

roomRoutes.get('/', async (req, res) => {
  try {
    const dormId = req.query.dormId as string;
    let rooms;
    if (dormId) {
      rooms = await RoomDB.getByDormId(dormId);
    } else {
      rooms = await RoomDB.getAll();
    }
    res.json({ message: 'Success', status: 200, data: rooms });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', status: 500, data: [] });
  }
});

roomRoutes.post('/:roomId/favorite', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { action } = req.body; // 'increase' or 'decrease'
    
    if (action !== 'increase' && action !== 'decrease') {
      return res.status(400).json({ message: 'Invalid action', status: 400 });
    }

    const room = await RoomDB.toggleFavorite(roomId, action === 'increase');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found', status: 404 });
    }

    res.json({ message: 'Success', status: 200, data: room });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', status: 500, data: null });
  }
});
