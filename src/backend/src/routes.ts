import { Router } from 'express';
import authRoutes from './routes/authRoutes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to DormArch API' });
});

export default router;
