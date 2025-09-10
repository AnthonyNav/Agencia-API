import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Paquete = sequelize.define('Paquete', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  titulo: { type: DataTypes.STRING(120), allowNull: false },
  destino: { type: DataTypes.STRING(120), allowNull: false },
  duracion_dias: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  duracion_noches: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  incluye: { type: DataTypes.JSON, allowNull: false }, // MySQL 5.7+ / 8 soporta JSON
  precio_mxn: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  imagen_url: { type: DataTypes.STRING(255), allowNull: true },
  politicas: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'paquetes',
  timestamps: false
});
