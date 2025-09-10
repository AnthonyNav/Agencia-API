import { sequelize } from '../db.js';

async function ensurePaquetes(qi) {
  const tables = (await qi.showAllTables()).map(t => (typeof t === 'object' ? t.tableName : t));
  if (!tables.includes('paquetes')) {
    await qi.createTable('paquetes', {
      id: { type: 'INTEGER', autoIncrement: true, primaryKey: true },
      slug: { type: 'VARCHAR(80)', allowNull: false, unique: true },
      titulo: { type: 'VARCHAR(120)', allowNull: false },
      destino: { type: 'VARCHAR(120)', allowNull: false },
      duracion_dias: { type: 'INTEGER', allowNull: false },
      duracion_noches: { type: 'INTEGER', allowNull: false },
      incluye: { type: 'JSON', allowNull: false },
      precio_mxn: { type: 'DECIMAL(10,2)', allowNull: false },
      imagen_url: { type: 'VARCHAR(255)', allowNull: true },
      politicas: { type: 'TEXT', allowNull: true },
      created_at: { type: 'DATETIME', allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await qi.addIndex('paquetes', ['destino'], { name: 'idx_paquetes_destino' });
    await qi.addIndex('paquetes', ['slug'], { name: 'idx_paquetes_slug', unique: true });
    console.log('✅ Tabla paquetes creada');
  } else {
    console.log('ℹ️ Tabla paquetes ya existe (skip)');
  }
}

async function ensureClientes(qi) {
  const tables = (await qi.showAllTables()).map(t => (typeof t === 'object' ? t.tableName : t));
  const hasClientes = tables.includes('clientes');
  if (!hasClientes) {
    await qi.createTable('clientes', {
      id: { type: 'INTEGER', autoIncrement: true, primaryKey: true },
      nombre: { type: 'VARCHAR(120)', allowNull: false },
      email: { type: 'VARCHAR(160)', allowNull: false },
      destino: { type: 'VARCHAR(120)', allowNull: false },
      paquete_id: { type: 'INTEGER', allowNull: true },
      numero_personas: { type: 'INTEGER', allowNull: false },
      fecha_viaje: { type: 'DATE', allowNull: false },
      comentarios: { type: 'TEXT', allowNull: true },
      created_at: { type: 'DATETIME', allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await qi.addIndex('clientes', ['email'], { name: 'idx_clientes_email' });
    await qi.addIndex('clientes', ['fecha_viaje'], { name: 'idx_clientes_fecha' });
    await qi.addIndex('clientes', ['paquete_id'], { name: 'idx_clientes_paquete' });
    // FK opcional (algunos providers con serverless limitan FKs)
    try {
      await sequelize.query(`
        ALTER TABLE clientes
        ADD CONSTRAINT fk_clientes_paquete
        FOREIGN KEY (paquete_id) REFERENCES paquetes(id)
        ON UPDATE CASCADE ON DELETE SET NULL
      `);
    } catch { /* ignora si no aplica */ }
    console.log('✅ Tabla clientes creada');
  } else {
    // añade paquete_id si falta
    const desc = await qi.describeTable('clientes');
    if (!desc.paquete_id) {
      await qi.addColumn('clientes', 'paquete_id', { type: 'INTEGER', allowNull: true });
      await qi.addIndex('clientes', ['paquete_id'], { name: 'idx_clientes_paquete' });
      try {
        await sequelize.query(`
          ALTER TABLE clientes
          ADD CONSTRAINT fk_clientes_paquete
          FOREIGN KEY (paquete_id) REFERENCES paquetes(id)
          ON UPDATE CASCADE ON DELETE SET NULL
        `);
      } catch { /* ignora si no aplica */ }
      console.log('🔧 Columna paquete_id agregada a clientes');
    } else {
      console.log('ℹ️ clientes.paquete_id ya existe (skip)');
    }
  }
}

try {
  await sequelize.authenticate();
  const qi = sequelize.getQueryInterface();
  await ensurePaquetes(qi);
  await ensureClientes(qi);
  process.exit(0);
} catch (e) {
  console.error('❌ Error en migrate:', e);
  process.exit(1);
}
