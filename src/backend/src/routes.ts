import { Router } from 'express';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

const router = Router();

// Mount authentication routes under /auth
router.use('/auth', authRoutes);

// Mount user routes under /users
router.use('/users', userRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to DormArch API' });
});

export default router;
