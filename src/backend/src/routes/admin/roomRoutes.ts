import { Router } from 'express';
import { Room } from '../../business/Room';
import { Bed } from '../../business/Bed';
import { GetRoomDto } from '@dormarch/shared';
import { RoomDB } from '../../database/RoomDB';
import { AuthRequest } from '../../middleware/authMiddleware';

export const roomRoutes = Router();

// GET / - List rooms with pagination & filters
roomRoutes.get('/', async (req, res) => {
  const dormId = (req as AuthRequest).user?.dormId;
  console.log('dormId: ', dormId);
  try {
    const query: GetRoomDto = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      search: req.query.search as string,
      dormId: req.query.dormId as string || dormId || undefined,
      status: req.query.status as string,
      totalBeds: req.query.totalBeds ? parseInt(req.query.totalBeds as string) : undefined,
      userIdCard: req.query.userIdCard as string
    };
    const result = await Room.fetchAll(query);
    res.json({ message: 'Success', status: 200, data: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

// GET /:id - Get room detail (including beds)
roomRoutes.get('/:id', async (req, res) => {
  try {
    const room = await Room.getById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found', status: 404 });
    res.json({ message: 'Success', status: 200, data: room });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
  }
});

// POST / - Create room
roomRoutes.post('/', async (req, res) => {
  try {
    const success = await Room.create(req.body);
    res.json({ message: 'Room created successfully', status: 201, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating room', status: 500 });
  }
});

// PUT /:id - Update room
roomRoutes.put('/:id', async (req, res) => {
  try {
    const success = await Room.update(req.params.id, req.body);
    res.json({ message: 'Room updated successfully', status: 200, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating room', status: 500 });
  }
});

// DELETE /:id - Delete room
roomRoutes.delete('/:id', async (req, res) => {
  try {
    const success = await Room.delete(req.params.id);
    res.json({ message: 'Room deleted successfully', status: 200, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting room', status: 500 });
  }
});

// --- BED MANAGEMENT ---

// POST /:id/beds - Add bed to room
roomRoutes.post('/:id/beds', async (req, res) => {
  try {
    const success = await Bed.addBed(req.params.id, req.body);
    res.json({ message: 'Bed added successfully', status: 201, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error adding bed', status: 500 });
  }
});

// PUT /beds/:bedId - Update bed
roomRoutes.put('/beds/:bedId', async (req, res) => {
  try {
    const success = await Bed.updateBed(req.params.bedId, req.body);
    res.json({ message: 'Bed updated successfully', status: 200, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating bed', status: 500 });
  }
});

// DELETE /beds/:bedId - Remove bed
roomRoutes.delete('/beds/:bedId', async (req, res) => {
  try {
    const success = await Bed.deleteBed(req.params.bedId);
    res.json({ message: 'Bed deleted successfully', status: 200, data: success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting bed', status: 500 });
  }
});


