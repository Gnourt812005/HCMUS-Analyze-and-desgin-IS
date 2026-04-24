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

roomRoutes.get('/:roomId/beds', async (req, res) => {
  try {
    const beds = await RoomDB.getBedsByRoomId(req.params.roomId);
    res.json({ message: 'Success', status: 200, data: beds });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', status: 500, data: [] });
  }
});
