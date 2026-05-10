import { Router } from 'express';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { checkoutRouter } from './routes/checkoutRoutes';
import { contractRouter } from './routes/contractRoutes';
import { refundRouter } from './routes/refundRoutes';
import { previewRoutes } from './routes/previewRoutes';
import { favouriteRoutes } from './routes/favouriteRoutes';
import { dormRoutes } from './routes/dormRoutes';

// ADMIN ROUTES IMPORTS
import adminUserRoutes from './routes/admin/userRoutes';
import { dormRoutes as adminDormRoutes } from './routes/admin/dormRoutes';
import { contractRouter as adminContractRouter } from './routes/admin/contractRoutes';
import { checkoutRouter as adminCheckoutRouter } from './routes/admin/checkoutRoutes';
import { refundRouter as adminRefundRouter } from './routes/admin/refundRoutes';
import { previewRoutes as adminPreviewRoutes } from './routes/admin/previewRoutes';
import { handoverRoutes as adminHandoverRoutes } from './routes/admin/handoverRoutes';
import { roomRoutes as adminRoomRoutes } from './routes/admin/roomRoutes';
import { rentalRoutes as adminRentalRoutes } from './routes/admin/rentalRoutes';
import { utilityRoutes as adminUtilityRoutes } from './routes/admin/utilityRoutes';
import { authMiddleware, authorize } from './middleware/authMiddleware';
import { UserRole } from '@dormarch/shared';

const router = Router();

// --- PUBLIC/STUDENT ROUTES ---
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dorms', dormRoutes);
router.use('/contracts', contractRouter);
router.use('/checkout-requests', checkoutRouter);
router.use('/refund-calculations', refundRouter);
router.use('/previews', previewRoutes);
router.use('/favourites', favouriteRoutes);

// --- ADMIN ROUTES ---

// Apply authMiddleware to all subsequent admin routes
router.use('/admin', authMiddleware);

// Previews: Accessible by ADMIN, MANAGER, and SALE_STAFF
router.use('/admin/previews', authorize(UserRole.MANAGER, UserRole.SALE_STAFF), adminPreviewRoutes);

// Admin/Manager routes (ADMIN bypasses, MANAGER is allowed)
const authManager = authorize(UserRole.MANAGER);
router.use('/admin/dorms', authManager, adminDormRoutes);
router.use('/admin/contracts', authManager, adminContractRouter);
router.use('/admin/checkout-requests', authManager, adminCheckoutRouter);
router.use('/admin/refund-calculations', authManager, adminRefundRouter);
router.use('/admin/handovers', authManager, adminHandoverRoutes);
router.use('/admin/rooms', authManager, adminRoomRoutes);
router.use('/admin/rentals', authManager, adminRentalRoutes);

router.use('/admin/utilities', adminUtilityRoutes);
router.use('/admin/users', adminUserRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to DormArch API' });
});

export default router;
