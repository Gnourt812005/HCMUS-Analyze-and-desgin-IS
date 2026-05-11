import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { dormRoutes } from './routes/dormRoutes';
import { rentalRoutes } from './routes/rentalRoutes';
import { paymentRoutes } from './routes/paymentRoutes';
import { roomRoutes } from './routes/roomRoutes';
import { previewRoutes } from './routes/previewRoutes';
import { handoverRoutes } from './routes/handoverRoutes';
import { utilityRoutes } from './routes/utilityRoutes';
import { checkoutRouter } from './routes/checkoutRoutes';
import { refundRouter } from './routes/refundRoutes';
import { contractRouter } from './routes/contractRoutes';
import { dbClient } from './database/DatabaseClient';
import { BackgroundTasks } from './utils/BackgroundTasks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api', routes);
app.use('/api/dorms', dormRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/previews', previewRoutes);
app.use('/api/handovers', handoverRoutes);
app.use('/api/utilities', utilityRoutes);
app.use('/api/checkout-requests', checkoutRouter);
app.use('/api/refund-calculations', refundRouter);
app.use('/api/contracts', contractRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {

  async function startServer() {
    try {
      const client = await dbClient.getClient();
      client.release();
    } catch (err) {
      console.error('💥 Could not start server: Database connection failed');
      process.exit(1);
    }
  }
  startServer();
  BackgroundTasks.start();
  console.log(`🚀 HappyHome Backend running at http://localhost:${PORT}`);
});
