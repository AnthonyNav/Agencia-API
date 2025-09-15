// index.js
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

// --- CORS CONFIG ---
const corsOptions = {
  origin(origin, cb) {
    // Permite peticiones sin 'Origin' (curl, server-side) o que estén en la lista
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('CORS: Not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // Cambia a true SOLO si usas cookies/credenciales
  preflightContinue: false,
  optionsSuccessStatus: 204, // para navegadores viejos
};

// Asegura respuestas cacheables por origen distinto
app.use((req, res, next) => {
  res.setHeader('Vary', 'Origin');
  next();
});

app.use(helmet());

// Aplica CORS global y responde preflights
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

if (LOG_REQUESTS) app.use(morgan('dev'));
app.use(express.json());

// Healthcheck
app.get('/api/health', async (_req, res) => {
  try {
    await assertDbConnection();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// Rutas API
app.use('/api/clientes', clientesRouter);
app.use('/api/paquetes', paquetesRouter);

// 404 opcional
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler (incluyendo CORS)
app.use((err, req, res, _next) => {
  if (err?.message?.startsWith('CORS:')) {
    // No es un 500; es un bloqueo CORS
    return res.status(403).json({
      error: 'CORS blocked',
      origin: req.headers.origin || null,
    });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, HOST, () => console.log(`🚀 API en http://${HOST}:${PORT}`));
