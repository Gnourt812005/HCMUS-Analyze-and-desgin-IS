import { Router } from 'express';
import { PreviewForm } from '../business/PreviewForm';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

export const previewRoutes = Router();

previewRoutes.post('/', async (req, res) => {
  try {
    const { roomId, userId, previewDatetime } = req.body;

    const {code, data} = await PreviewForm.createPreviewForm(userId, roomId, previewDatetime);
    
    if (code === 1) {
      return res.status(400).json({ message: 'Phòng đã được đặt lịch hẹn vào thời gian này', status: 400, data: null });
    }
    else if (code === 2) {
      return res.status(400).json({ message: 'Bạn đã có một lịch hẹn khác vào thời gian này', status: 400, data: null });
    }
    else if (code === 3) {
      return res.status(400).json({ message: 'Không có nhân viên nào sẵn sàng vào thời gian này', status: 400, data: null });
    }
    else if (code === 4) {
      return res.status(500).json({ message: 'Lỗi server', status: 500, data: null });
    }
    else{
      res.json({ message: 'Success', status: 200, data: data });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', status: 500, data: null });
  }
});

// Get user's preview forms
previewRoutes.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: 'Unauthorized' });

    const {code, data} = await PreviewForm.getPreviewsByUserId(email);

    if (code === 1) {
      res.status(500).json({ message: 'Server error', status: 500, data: null });
    } else {
      res.json({ message: 'Success', status: 200, data });
    }
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

    const {code, data} = await PreviewForm.getPreviewsByStaffId(email);
    if (code === 1) {
      res.status(500).json({ message: 'Server error', status: 500, data: null });
    } 
    else {
      res.json({ message: 'Success', status: 200, data });
    }
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

    const {code, data} = await PreviewForm.getStaffPreviewDetails(id, email);

    if (code === 1) {
      res.status(404).json({ message: 'Not found' });
    }
    if (code === 2) {
      res.status(403).json({ message: 'Forbidden' });
    }
    if (code === 3) {
      console.error("Error fetching staff preview details");
      res.status(500).json({ message: 'Server error' });
    }
    else{
      res.json({ message: 'Success', status: 200, data });
    }
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

    const {code, data} = await PreviewForm.getUserPreviewDetails(id, email);

    if (code === 1) {
      res.status(404).json({ message: 'Not found' });
    }
    else if (code === 2) {
      res.status(403).json({ message: 'Forbidden' });
    }
    else if (code === 3) {
      console.error("Error fetching preview details");
      res.status(500).json({ message: 'Server error' });
    }
    else{
      res.json({ message: 'Success', status: 200, data });
    }
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

    const {code, data} = await PreviewForm.reschedulePreviewByStaff(id, email, wantedPreviewDate, wantedPreviewTime);

    if (code === 1) {
      res.status(404).json({ message: 'Not found' });
    }
    if (code === 2) {
      res.status(403).json({ message: 'Forbidden' });
    }
    if (code === 3) {
      res.status(400).json({ message: 'Chỉ có thể dời lịch đơn đang chờ xử lý' });
    }
    if (code === 4) {
      res.status(500).json({ message: 'Failed to update' });
    }
    if (code === 5) {
      console.error("Error rescheduling preview");
      res.status(500).json({ message: 'Server error' });
    }
    else {
      res.json({ message: 'Dời lịch thành công', status: 200, data: null });
    }
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

    const {code, data} = await PreviewForm.cancelPreviewByUser(id, email);

    if (code === 1) {
      res.status(404).json({ message: 'Not found' });
    }
    else if (code === 2) {
      res.status(403).json({ message: 'Forbidden' });
    }
    else if (code === 3) {
      res.status(400).json({ message: 'Chỉ có thể hủy lịch đơn đang chờ xử lý' });
    }
    else if (code === 4) {
      res.status(500).json({ message: 'Failed to update' });
    }
    else if (code === 5) {
      console.error("Error canceling preview");
      res.status(500).json({ message: 'Server error' });
    }
    else {
      res.json({ message: 'Hủy lịch hẹn thành công', status: 200, data: null });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


