import { Router } from 'express';
import { PreviewFormDB } from '../database/PreviewFormDB';
import { RoomDB } from '../database/RoomDB';
import { DormDB } from '../database/DormDB';
import { UserDB } from '../database/UserDB';
import { PreviewForm } from '../business/PreviewForm';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

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

previewRoutes.post('/', async (req, res) => {
  try {
    const { roomId, userId, previewDatetime } = req.body;

    const allForms = await PreviewFormDB.getAll();
    const newFormDate = new Date(previewDatetime);

    // Helper: check if two dates are functionally identically close (e.g. within an hour or exactly same date to avoid double booking)
    const isSameDate = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString() && d1.getHours() === d2.getHours();

    // 1. Check room availability
    const roomConflict = allForms.find(f => 
      f.roomId === roomId && 
      isSameDate(new Date(f.previewDatetime), newFormDate) && 
      f.status === 'pending'
    );

    if (roomConflict) {
      return res.status(400).json({ message: 'Phòng đã có lịch hẹn xem vào thời gian này', status: 400, data: null });
    }

    // 2. Check guest availability
    const userConflict = allForms.find(f => 
      f.userId === userId && 
      isSameDate(new Date(f.previewDatetime), newFormDate) && 
      f.status === 'pending'
    );

    if (userConflict) {
      return res.status(400).json({ message: 'Bạn đã có một lịch hẹn xem phòng khác vào thời gian này', status: 400, data: null });
    }

    // 3. Automatic Employee Assignment
    const staffs = await UserDB.fetchEmployeesByRole(UserRole.SALES_STAFF);
    let assignedStaffId = null;

    // Find a staff member that does NOT have a scheduling conflict
    for (const staff of staffs) {
      const staffConflict = allForms.find(f => 
        f.staffId === staff.email && 
        isSameDate(new Date(f.previewDatetime), newFormDate) && 
        f.status === 'pending'
      );
      if (!staffConflict) {
        assignedStaffId = staff.email;
        break;
      }
    }

    if (!assignedStaffId) {
      return res.status(400).json({ message: 'Không có nhân viên trống vào khung giờ này', status: 400, data: null });
    }
    
    const newForm = new PreviewForm({
      formId: `prev-${Date.now()}`,
      roomId,
      userId,
      previewDatetime,
      status: 'pending',
      staffId: assignedStaffId
    });

    await PreviewFormDB.insert(newForm);

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

    // Find preview forms for this user directly from PreviewFormDB
    const allForms = await PreviewFormDB.getAll();
    const userForms = allForms.filter(f => f.userId === email);

    // Map to PreviewBriefDTO
    const data = await Promise.all(userForms.map(async (f) => {
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

// Get staff's assigned preview forms
previewRoutes.get('/staff', authMiddleware, async (req: AuthRequest, res) => {
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
previewRoutes.get('/staff/:id', authMiddleware, async (req: AuthRequest, res) => {
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

// Get preview form details
previewRoutes.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const email = req.user?.email;

    if (!email) {
       return res.status(401).json({ message: 'Unauthorized' });
    }

    const form = await PreviewFormDB.getById(id);
    if (!form) return res.status(404).json({ message: 'Not found' });

    if (form.userId !== email) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { roomName, dormId, dormName, dormAddress } = await getRoomAndDormInfo(form.roomId);

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

// Staff reschedules a preview form
previewRoutes.put('/staff/:id/reschedule', authMiddleware, async (req: AuthRequest, res) => {
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

// Cancel a preview form
previewRoutes.put('/:id/cancel', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const email = req.user?.email;

    if (!email) {
       return res.status(401).json({ message: 'Unauthorized' });
    }

    const form = await PreviewFormDB.getById(id);
    if (!form) return res.status(404).json({ message: 'Not found' });

    if (form.userId !== email) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Only allow canceling if status is pending
    if (form.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending previews can be cancelled' });
    }

    const success = await PreviewFormDB.updateStatus(id, 'cancelled');
    if (!success) {
      return res.status(500).json({ message: 'Failed to update' });
    }

    res.json({ message: 'Hủy lịch hẹn thành công', status: 200, data: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


