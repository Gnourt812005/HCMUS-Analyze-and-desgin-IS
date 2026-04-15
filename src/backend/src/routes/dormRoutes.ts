import { Router } from 'express';
import { DormDB } from '../database/DormDB';

export const dormRoutes = Router();

dormRoutes.get('/', async (req, res) => {
  try {
    const dorms = await DormDB.getAll();
    res.json({ message: 'Success', status: 200, data: dorms });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', status: 500, data: [] });
  }
});
