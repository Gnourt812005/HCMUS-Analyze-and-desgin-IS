import { Router } from 'express';
import { PreviewFormDB } from '../../database/PreviewFormDB';
import { RoomDB } from '../../database/RoomDB';
import { DormDB } from '../../database/DormDB';
import { UserDB } from '../../database/UserDB';
import { PreviewForm } from '../../business/PreviewForm';
import { AuthRequest } from '../../middleware/authMiddleware';

import { UserRole } from '@dormarch/shared';

// Helper function to extract Room and Dorm details
async function getRoomAndDormInfo(roomId: string) {
  const dorms = await DormDB.fetchAll({});
  for (const dorm of dorms.dorms) {
    if (!dorm.id) continue;
    const result = await RoomDB.fetchAll({ dormId: dorm.id });
    const rooms = result.rooms;
    const match = rooms.find((r) => r.id === roomId);
    if (match) {
      return {
        roomName: match.name || '',
        dormId: dorm.id,
        dormName: dorm.name || '',
        dormAddress: dorm.address || ''
      };
    }
  }
  return { roomName: '', dormId: '', dormName: '', dormAddress: '' };
}

export const previewRoutes = Router();

// ─── Staff management routes ──────────────────────────────────

// Get staff's assigned preview forms
previewRoutes.get('/staff', async (req: AuthRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: 'Unauthorized' });

    const allForms = await PreviewFormDB.getAll();
    const staffForms = allForms.filter((f) => f.staffId === email);

    const data = await Promise.all(staffForms.map(async (f) => {
      const { roomName, dormName, dormAddress } = await getRoomAndDormInfo(f.roomId);

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

// Get staff's assigned preview form details
previewRoutes.get('/staff/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const form = await PreviewFormDB.getById(id);
    if (!form) return res.status(404).json({ message: 'Not found' });

    if (form.staffId !== email) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { roomName, dormId, dormName, dormAddress } = await getRoomAndDormInfo(form.roomId);

    let customerInfo = null;
    if (form.userId) {
      const customer = await UserDB.fetchCredentialByEmail(form.userId);
      if (customer) {
        customerInfo = {
          name: customer.fullName,
          phone: customer.phone || 'Chưa cung cấp'
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
      customerInfo,
      createdAt: form.createdDatetime
    };

    res.json({ message: 'Success', status: 200, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Staff reschedules a preview form ──────────────────────────────────

// Staff reschedules a preview form
previewRoutes.put('/staff/:id/reschedule', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { wantedPreviewDate, wantedPreviewTime } = req.body;
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const form = await PreviewFormDB.getById(id);
    if (!form) return res.status(404).json({ message: 'Not found' });

    if (form.staffId !== email) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (form.status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể dời lịch đơn đang chờ xử lý' });
    }

    const newDatetime = `${wantedPreviewDate}T${wantedPreviewTime}:00.000Z`;
    const success = await PreviewFormDB.updateDatetime(id, newDatetime);
    if (!success) {
      return res.status(500).json({ message: 'Failed to update' });
    }

    res.json({ message: 'Dời lịch thành công', status: 200, data: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});




