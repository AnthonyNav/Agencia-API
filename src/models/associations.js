import { Cliente } from './cliente.model.js';
import { Paquete } from './paquete.model.js';

export function setupAssociations() {
  Paquete.hasMany(Cliente, { foreignKey: 'paquete_id' });
  Cliente.belongsTo(Paquete, { foreignKey: 'paquete_id' });
}
