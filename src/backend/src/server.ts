import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { dormRoutes } from './routes/dormRoutes';
import { contractRoutes } from './routes/contractRoutes';
import { handoverRoutes } from './routes/handoverRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api', routes);
app.use('/api/dorms',    dormRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/handover',  handoverRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 DormArch Backend running at http://localhost:${PORT}`);
});
