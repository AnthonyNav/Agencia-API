import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { HOST, PORT, ALLOWED_ORIGINS, LOG_REQUESTS, LOG_CORS } from './config.js';
import { assertDbConnection } from './db.js';
import clientesRouter from './routes/clientes.js';
import paquetesRouter from './routes/paquetes.js';
import { setupAssociations } from './models/associations.js';

setupAssociations();

const app = express();
app.disable('x-powered-by');

// Evitar problemas de caché por origen
app.use((req, res, next) => {
  res.setHeader('Vary', 'Origin');
  next();
});

// API pública: desactivar CORP
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// --- helpers CORS con soporte de comodines ---
const wildcardToRegExp = (pattern) => {
  // '*' => '.*' y escapamos el resto
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\*/g, '.*');
  return new RegExp(`^${escaped}$`);
};

// Si no hay orígenes configurados, tratamos como "permitir todos" (pero reflejando el Origin)
const allowAll = ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes('*');
const testers = allowAll
  ? [/.*/]
  : ALLOWED_ORIGINS.map(wildcardToRegExp);

const isAllowed = (origin) => {
  if (!origin) return true;          // curl/SSR
  return testers.some(rx => rx.test(origin));
};

const corsOptions = {
  origin(origin, cb) {
    const allowed = isAllowed(origin);
    if (LOG_CORS) console.log(`[CORS] ${origin ?? '(no-origin)'} => ${allowed ? 'ALLOW' : 'BLOCK'}`);
    if (!allowed) return cb(new Error('CORS: Not allowed'));
    // Reflejamos el origen permitido (mejor para credenciales futuras)
    return cb(null, origin || true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // ⚠️ No fije allowedHeaders: deja que CORS refleje los solicitados en preflight
  credentials: false,               // cambia a true si usarás cookies/autenticación del navegador
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Preflight para TODAS las rutas (Express 5 no acepta '*')
app.options(/.*/, cors(corsOptions));

if (LOG_REQUESTS) app.use(morgan('dev'));
app.use(express.json());

// Health
app.get('/api/health', async (_req, res) => {
  try { await assertDbConnection(); res.json({ ok: true }); }
  catch { res.status(500).json({ ok: false }); }
});

// Rutas
app.use('/api/clientes', clientesRouter);
app.use('/api/paquetes', paquetesRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler (incluye CORS)
app.use((err, req, res, _next) => {
  if (err?.message?.startsWith('CORS:')) {
    if (LOG_CORS) console.warn(`[CORS] BLOCKED origin=${req.headers.origin}`);
    return res.status(403).json({
      error: 'CORS blocked',
      origin: req.headers.origin || null,
    });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 API en http://${HOST}:${PORT}`);
  console.log(`[CORS] ALLOWED_ORIGINS = ${ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS.join(' | ') : '(allow all)'}`);
});
