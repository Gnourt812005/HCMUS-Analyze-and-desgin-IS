import { Router } from 'express';
import { PreviewFormDB } from '../database/PreviewFormDB';
import { PreviewForm_UserDB } from '../database/PreviewForm_UserDB';
import { RoomDB } from '../database/RoomDB';
import { DormDB } from '../database/DormDB';
import { UserDB } from '../database/UserDB';
import { PreviewForm } from '../business/PreviewForm';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

export const previewRoutes = Router();

previewRoutes.post('/', async (req, res) => {
  try {
    const { roomId, userId, previewDatetime } = req.body;
    
    const newForm = new PreviewForm({
      formId: `prev-${Date.now()}`,
      roomId,
      userId,
      previewDatetime,
      status: 'ongoing',
      staffId: null
    });

    await PreviewFormDB.insert(newForm);
    await PreviewForm_UserDB.insert(userId, newForm.formId);

    res.json({ message: 'Success', status: 200, data: newForm });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', status: 500, data: null });
  }
});

// Get user's preview forms
previewRoutes.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: 'Unauthorized' });

    // Find preview forms for this user
    const formIds = await PreviewForm_UserDB.getFormsByUserId(email);
    const allForms = await PreviewFormDB.getAll();
    const userForms = allForms.filter(f => formIds.includes(f.formId));

    const dorms = await DormDB.getAll();
    
    // Map to PreviewBriefDTO
    const data = await Promise.all(userForms.map(async (f) => {
      // Find room in all rooms
      let roomName = '';
      let dormName = '';
      let dormAddress = '';

      for (const dorm of dorms) {
        const rooms = await RoomDB.getByDormId(dorm.id!);
        const match = rooms.find(r => r.id === f.roomId);
        if (match) {
          roomName = match.name || '';
          dormName = dorm.name || '';
          dormAddress = dorm.address || '';
          break;
        }
      }

      return {
        id: f.formId,
        roomName,
        dormName,
        dormAddress,
        previewDate: f.previewDatetime.split('T')[0],
        previewTime: f.previewDatetime.split('T')[1].substring(0, 5),
        status: f.status
      };
    }));

    res.json({ message: 'Success', status: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get preview form details
previewRoutes.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const email = req.user?.email;

    if (!email) {
       return res.status(401).json({ message: 'Unauthorized' });
    }

    const formIds = await PreviewForm_UserDB.getFormsByUserId(email);
    if (!formIds.includes(id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const form = await PreviewFormDB.getById(id);
    if (!form) return res.status(404).json({ message: 'Not found' });

    const dorms = await DormDB.getAll();
    let roomName = '';
    let dormId = '';
    let dormName = '';
    let dormAddress = '';

    for (const dorm of dorms) {
      const rooms = await RoomDB.getByDormId(dorm.id!);
      const match = rooms.find(r => r.id === form.roomId);
      if (match) {
        roomName = match.name || '';
        dormId = dorm.id!;
        dormName = dorm.name || '';
        dormAddress = dorm.address || '';
        break;
      }
    }

    let salesStaff = null;
    if (form.staffId) {
      const staff = await UserDB.fetchCredentialByEmail(form.staffId);
      if (staff) {
        salesStaff = {
          name: staff.fullName,
          phone: staff.phone
        };
      }
    }

    const data = {
      id: form.formId,
      roomId: form.roomId,
      roomName,
      dormId,
      dormName,
      dormAddress,
      date: form.previewDatetime.split('T')[0],
      time: form.previewDatetime.split('T')[1].substring(0, 5),
      salesStaff,
      createdAt: form.createdDatetime,
      status: form.status
    };

    res.json({ message: 'Success', status: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a preview form
previewRoutes.put('/:id/cancel', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const email = req.user?.email;

    if (!email) {
       return res.status(401).json({ message: 'Unauthorized' });
    }

    const formIds = await PreviewForm_UserDB.getFormsByUserId(email);
    if (!formIds.includes(id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const form = await PreviewFormDB.getById(id);
    if (!form) return res.status(404).json({ message: 'Not found' });

    // Only allow canceling if status is ongoing
    if (form.status !== 'ongoing') {
      return res.status(400).json({ message: 'Only ongoing previews can be canceled' });
    }

    const success = await PreviewFormDB.updateStatus(id, 'canceled');
    if (!success) {
      return res.status(500).json({ message: 'Failed to update' });
    }

    res.json({ message: 'Hủy lịch hẹn thành công', status: 200, data: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


