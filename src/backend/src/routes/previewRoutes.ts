import { Router } from 'express';
import { PreviewFormDB } from '../database/PreviewFormDB';
import { PreviewForm } from '../business/PreviewForm';

export const previewRoutes = Router();

previewRoutes.post('/', async (req, res) => {
  try {
    const { roomId, userId, previewDatetime } = req.body;
    
    // Server-side creating the PreviewForm business model object
    const newForm = new PreviewForm({
      formId: `prev-${Date.now()}`,
      roomId,
      userId,
      previewDatetime,
      status: 'ongoing',
      staffId: null
    });

    await PreviewFormDB.insert(newForm);

    res.json({ message: 'Success', status: 200, data: newForm });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', status: 500, data: null });
  }
});
