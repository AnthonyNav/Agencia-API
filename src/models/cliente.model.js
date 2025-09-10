import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Cliente = sequelize.define('Cliente', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(120), allowNull: false, validate: { len: [1,120] } },
  email:  { type: DataTypes.STRING(160), allowNull: false, validate: { isEmail: true } },
  destino:{ type: DataTypes.STRING(120), allowNull: false },
  numero_personas: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, validate: { min: 1 } },
  fecha_viaje: { type: DataTypes.DATEONLY, allowNull: false,
    validate: {
      esFutura(value) {
        const d = new Date(`${value}T00:00:00`);
        const t = new Date(); t.setHours(0,0,0,0);
        if (Number.isNaN(+d) || d <= t) throw new Error('La fecha debe ser futura (YYYY-MM-DD)');
      }
    }
  },
  comentarios: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'clientes',
  timestamps: false
});
