import { sequelize } from '../db.js';
import { Paquete } from '../models/paquete.model.js';
import { Cliente } from '../models/cliente.model.js';

const paquetesBase = [
  { slug:'cancun-all-inclusive', titulo:'Cancún All-Inclusive', destino:'Cancún, México', duracion_dias:5, duracion_noches:4, incluye:['Hospedaje','Vuelos redondos','Transporte','Tours','Comidas y bebidas ilimitadas'], precio_mxn:15000.00, imagen_url:'https://example.com/img/cancun.jpg', politicas:'Cancelación gratis hasta 7 días antes. Después, 50% de penalización.' },
  { slug:'europa-15-dias', titulo:'Europa en 15 días', destino:'Europa', duracion_dias:15, duracion_noches:14, incluye:['Vuelos intercontinentales','Trenes entre ciudades','Hoteles 3-4*','Desayunos','City tours selectos'], precio_mxn:65000.00, imagen_url:'https://example.com/img/europa.jpg', politicas:'Cambios con costo administrativo. Cancelación 70% hasta 15 días antes; no reembolsable después.' },
  { slug:'experiencia-nueva-york', titulo:'Experiencia en Nueva York', destino:'Nueva York, EUA', duracion_dias:6, duracion_noches:5, incluye:['Vuelo redondo','Hotel Manhattan/Queens','Traslados','Tour panorámico','Asistencia'], precio_mxn:28000.00, imagen_url:'https://example.com/img/nyc.jpg', politicas:'Cancelación sin costo hasta 10 días antes. No-show: no reembolsable.' },
  { slug:'safari-africa', titulo:'Safari en África', destino:'Kenia/Tanzania', duracion_dias:8, duracion_noches:7, incluye:['Vuelos internos','Lodges/Safaris','Guía experto','Comidas','Transporte 4x4'], precio_mxn:90000.00, imagen_url:'https://example.com/img/safari.jpg', politicas:'Depósito 20% no reembolsable. Saldo 21 días antes.' },
  { slug:'maravillas-de-asia', titulo:'Maravillas de Asia', destino:'Asia (Japón/Tailandia)', duracion_dias:12, duracion_noches:11, incluye:['Vuelos redondos','Hoteles 4*','Traslados','Guías en español','Entradas'], precio_mxn:75000.00, imagen_url:'https://example.com/img/asia.jpg', politicas:'Reembolso 80% hasta 20 días; 50% hasta 10 días; después no reembolsable.' },
  { slug:'ruta-por-sudamerica', titulo:'Ruta por Sudamérica', destino:'Perú/Chile/Argentina', duracion_dias:10, duracion_noches:9, incluye:['Vuelos regionales','Hoteles 3-4*','Desayunos','Tours Machu Picchu/Viña/Bariloche'], precio_mxn:42000.00, imagen_url:'https://example.com/img/sudamerica.jpg', politicas:'Cambios sujetos a disponibilidad y cargos de aerolínea.' },
  { slug:'islas-del-caribe', titulo:'Islas del Caribe', destino:'Caribe', duracion_dias:7, duracion_noches:6, incluye:['Crucero u hotel','Todo incluido','Actividades acuáticas','Traslados','Asistencia'], precio_mxn:38000.00, imagen_url:'https://example.com/img/caribe.jpg', politicas:'Cancelación gratis hasta 14 días antes. Penalización 30% posterior.' },
  { slug:'desierto-de-dubai', titulo:'Desierto de Dubái', destino:'Dubái, EAU', duracion_dias:6, duracion_noches:5, incluye:['Vuelo redondo','Hotel 4*','Safari en desierto','City tour','Traslados'], precio_mxn:46000.00, imagen_url:'https://example.com/img/dubai.jpg', politicas:'Visado no incluido (si aplica). Cancelación 60% hasta 10 días antes.' },
  { slug:'canada-y-sus-paisajes', titulo:'Canadá y sus paisajes', destino:'Canadá', duracion_dias:7, duracion_noches:6, incluye:['Vuelo redondo','Hoteles 3-4*','Tour Montañas Rocosas','Traslados','Seguro básico'], precio_mxn:40000.00, imagen_url:'https://example.com/img/canada.jpg', politicas:'Reembolso 70% hasta 12 días; 40% hasta 5 días; después no reembolsable.' },
  { slug:'ruta-maya-mexico', titulo:'Ruta Maya México', destino:'Ruta Maya, México', duracion_dias:5, duracion_noches:4, incluye:['Hoteles 4*','Traslados','Entradas a zonas arqueológicas','Guía certificado','Desayunos'], precio_mxn:18000.00, imagen_url:'https://example.com/img/ruta-maya.jpg', politicas:'Cancelación sin costo hasta 7 días. Después, penalización 30%.' }
];

const clientesBase = [
  { nombre:'Juan Pérez',   email:'juan.perez@example.com',   slug:'cancun-all-inclusive',     numero_personas:2, fecha_viaje:'2025-12-20', comentarios:'Vista al mar' },
  { nombre:'Carla Gómez',  email:'carla.gomez@example.com',  slug:'europa-15-dias',          numero_personas:1, fecha_viaje:'2026-01-10', comentarios:'Single' },
  { nombre:'Luis Díaz',    email:'luis.diaz@example.com',    slug:'experiencia-nueva-york',  numero_personas:3, fecha_viaje:'2025-11-15', comentarios:'Broadway' },
  { nombre:'María Ruiz',   email:'mruiz@example.com',        slug:'safari-africa',           numero_personas:2, fecha_viaje:'2026-02-05', comentarios:'Aniversario' },
  { nombre:'Ana López',    email:'ana.lopez@example.com',    slug:'maravillas-de-asia',      numero_personas:4, fecha_viaje:'2026-03-12', comentarios:'Guía en español' },
  { nombre:'Pedro Castillo',email:'pedro.castillo@example.com',slug:'ruta-por-sudamerica',    numero_personas:2, fecha_viaje:'2025-12-05', comentarios:'Meses' }
];

try {
  await sequelize.authenticate();

  // Seed paquetes si vacío
  if (await Paquete.count() === 0) {
    await Paquete.bulkCreate(paquetesBase);
    console.log('🌱 Paquetes insertados');
  } else {
    console.log('ℹ️ Paquetes ya existen (skip)');
  }

  // Seed clientes si vacío
  if (await Cliente.count() === 0) {
    // Mapea slug → paquete
    const map = Object.fromEntries((await Paquete.findAll({ attributes: ['id','slug','titulo'] }))
      .map(p => [p.slug, { id: p.id, titulo: p.titulo }]));

    const toInsert = clientesBase.map(c => ({
      nombre: c.nombre,
      email: c.email,
      destino: map[c.slug]?.titulo ?? 'Sin paquete',
      paquete_id: map[c.slug]?.id ?? null,
      numero_personas: c.numero_personas,
      fecha_viaje: c.fecha_viaje,
      comentarios: c.comentarios ?? null
    }));
    await Cliente.bulkCreate(toInsert);
    console.log('🌱 Clientes insertados');
  } else {
    console.log('ℹ️ Clientes ya existen (skip)');
  }

  process.exit(0);
} catch (e) {
  console.error('❌ Error en seed:', e);
  process.exit(1);
}
