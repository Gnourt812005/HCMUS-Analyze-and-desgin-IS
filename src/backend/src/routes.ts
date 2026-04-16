import { Router } from 'express';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { checkoutRouter } from './routes/checkoutRoutes';
import { contractRouter } from './routes/contractRoutes';

const router = Router();

// Mount authentication routes under /auth
router.use('/auth', authRoutes);

// Mount user routes under /users
router.use('/users', userRoutes);

// Mount contract routes under /contracts
router.use('/contracts', contractRouter);

// Mount checkout routes under /checkout-requests
router.use('/checkout-requests', checkoutRouter);

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to DormArch API' });
});

export default router;
