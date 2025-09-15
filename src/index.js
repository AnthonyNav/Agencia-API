import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { HOST, PORT, ALLOWED_ORIGINS, LOG_REQUESTS } from './config.js';
import { assertDbConnection } from './db.js';
import clientesRouter from './routes/clientes.js';
import paquetesRouter from './routes/paquetes.js';
import { setupAssociations } from './models/associations.js';

setupAssociations();

const app = express();
app.disable('x-powered-by');

// --- CORS ---
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl, server-side, etc.
    if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('CORS: Not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,               // pon true solo si usas cookies/credenciales
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Importante para caches intermedios
app.use((req, res, next) => {
  res.setHeader('Vary', 'Origin');
  next();
});

app.use(helmet());
app.use(cors(corsOptions));

// ⛔️ ANTES: app.options('*', cors(corsOptions));
// ✅ AHORA (Express 5 friendly): preflight para cualquier ruta
app.options(/.*/, cors(corsOptions));
// Si prefieres solo /api: app.options(/^\/api\/.*/i, cors(corsOptions));

if (LOG_REQUESTS) app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try { await assertDbConnection(); res.json({ ok: true }); }
  catch { res.status(500).json({ ok: false }); }
});

app.use('/api/clientes', clientesRouter);
app.use('/api/paquetes', paquetesRouter);

// 404 opcional
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler (incluye errores de CORS)
app.use((err, req, res, _next) => {
  if (err?.message?.startsWith('CORS:')) {
    return res.status(403).json({
      error: 'CORS blocked',
      origin: req.headers.origin || null,
    });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, HOST, () => console.log(`🚀 API en http://${HOST}:${PORT}`));
