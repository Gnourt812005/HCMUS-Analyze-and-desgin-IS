import { Router } from 'express';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { checkoutRouter } from './routes/checkoutRoutes';
import { contractRouter } from './routes/contractRoutes';
import { refundRouter } from './routes/refundRoutes';
import { previewRoutes } from './routes/previewRoutes';
import { favouriteRoutes } from './routes/favouriteRoutes';

import { dormRoutes } from './routes/dormRoutes';

const router = Router();

// Mount authentication routes under /auth
router.use('/auth', authRoutes);

// Mount user routes under /users
router.use('/users', userRoutes);

// Mount dorm routes under /dorms
router.use('/dorms', dormRoutes);

// Mount contract routes under /contracts
router.use('/contracts', contractRouter);

// Mount checkout routes under /checkout-requests
router.use('/checkout-requests', checkoutRouter);

// Mount refund calculation routes under /refund-calculations
router.use('/refund-calculations', refundRouter);
// Mount preview routes under /previews
router.use('/previews', previewRoutes);

// Mount favourites routes under /favourites
router.use('/favourites', favouriteRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to DormArch API' });
});

export default router;
