import 'dotenv/config';

const bool = (v, d=false) => v===undefined ? d : /^(1|true|yes)$/i.test(String(v));
const pick = (...vals) => vals.find(v => v !== undefined && v !== '') ?? undefined;

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const HOST     = process.env.HOST || '0.0.0.0';
export const PORT     = Number(process.env.PORT || 3001);

export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',').map(s => s.trim()).filter(Boolean);

// DB: toma DB_* o, si no, MYSQL* (Railway)
export const DB_HOST = pick(process.env.DB_HOST, process.env.MYSQLHOST, 'localhost');
export const DB_PORT = Number(pick(process.env.DB_PORT, process.env.MYSQLPORT, 3306));
export const DB_USER = pick(process.env.DB_USER, process.env.MYSQLUSER, 'root');
export const DB_PASSWORD = pick(process.env.DB_PASSWORD, process.env.MYSQLPASSWORD, '');
export const DB_NAME = pick(process.env.DB_NAME, process.env.MYSQLDATABASE, 'agencia');
export const DB_SSL  = bool(pick(process.env.DB_SSL, process.env.MYSQL_SSL), false);

export const LOG_REQUESTS = bool(process.env.LOG_REQUESTS, true);
export const ENABLE_PACKAGES = bool(process.env.ENABLE_PACKAGES, false);
export const LOG_CORS = bool(process.env.LOG_CORS, true);
