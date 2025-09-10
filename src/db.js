import { Sequelize } from 'sequelize';
import {
  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL
} from './config.js';

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
  dialectOptions: DB_SSL ? { ssl: { rejectUnauthorized: true } } : {}
});

// Helper para verificar conexión (opcional)
export async function assertDbConnection() {
  await sequelize.authenticate();
}
