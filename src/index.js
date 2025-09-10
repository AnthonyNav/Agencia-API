import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { HOST, PORT, ALLOWED_ORIGINS, LOG_REQUESTS } from './config.js';
import { assertDbConnection } from './db.js';
import clientesRouter from './routes/clientes.js';
import paquetesRouter from './routes/paquetes.js';
import { setupAssociations } from './models/associations.js';

setupAssociations(); // relaciones listas

const app = express();
app.disable('x-powered-by');
app.use(helmet());

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  }
}));

if (LOG_REQUESTS) app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try { await assertDbConnection(); res.json({ ok: true }); }
  catch { res.status(500).json({ ok: false }); }
});

app.use('/api/clientes', clientesRouter);
app.use('/api/paquetes', paquetesRouter);

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, HOST, () => console.log(`🚀 API en http://${HOST}:${PORT}`));
