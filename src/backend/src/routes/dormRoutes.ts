import { Router } from 'express';
import { DormDB } from '../database/DormDB';
import { RentalDB } from '../database/RentalDB';

export const dormRoutes = Router();

dormRoutes.get('/', async (req, res) => {
  try {
    const dorms = await DormDB.getAll();
    res.json({ message: 'Success', status: 200, data: dorms });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', status: 500, data: [] });
  }
});

dormRoutes.get('/:dormId/rooms', async (req, res) => {
  try {
    const rooms = await RentalDB.listRoomBedsByDorm(req.params.dormId);
    res.json({ message: 'Success', status: 200, data: rooms });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Cannot fetch rooms', status: 500, data: [] });
  }
});
