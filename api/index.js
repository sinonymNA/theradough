import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDB } from './db.js';
import dropsRouter from './routes/drops.js';
import menuRouter from './routes/menu.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api/drops', dropsRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

// Always serve the built Vite app (Railway doesn't set NODE_ENV=production)
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.use((req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;

await initDB();
app.listen(PORT, () => {
  console.log(`TheraDough API running on port ${PORT}`);
});
