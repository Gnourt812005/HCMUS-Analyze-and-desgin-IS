import { Router } from 'express';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { previewRoutes } from './routes/previewRoutes';
import { favouriteRoutes } from './routes/favouriteRoutes';

const router = Router();

// Mount authentication routes under /auth
router.use('/auth', authRoutes);

// Mount user routes under /users
router.use('/users', userRoutes);

// Mount preview routes under /previews
router.use('/previews', previewRoutes);

// Mount favourites routes under /favourites
router.use('/favourites', favouriteRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to DormArch API' });
});

export default router;
