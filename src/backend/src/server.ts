import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { dormRoutes } from './routes/dormRoutes';
import { rentalRoutes } from './routes/rentalRoutes';
import { paymentRoutes } from './routes/paymentRoutes';
import { roomRoutes } from './routes/roomRoutes';
import { previewRoutes } from './routes/previewRoutes';

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

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 DormArch Backend running at http://localhost:${PORT}`);
});
