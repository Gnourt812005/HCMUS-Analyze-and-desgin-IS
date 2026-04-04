import { Router } from 'express';

const router = Router();

// Placeholder for future routes
// e.g., router.use('/rooms', roomRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to DormArch API' });
});

export default router;
