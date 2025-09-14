import { Cliente } from '../models/cliente.model.js';
import { Paquete } from '../models/paquete.model.js';
import { isEmail, isFutureISO } from '../utils/validate.js';

export async function listarClientes(_req, res) {
  const rows = await Cliente.findAll({
    order: [['id','DESC']],
    attributes: ['id','nombre','email','destino','numero_personas','fecha_viaje','comentarios','created_at','paquete_id'],
    include: [{ model: Paquete, attributes: ['id','slug','titulo','precio_mxn','imagen_url'] }]
  });
  res.json(rows);
}

/**
 * POST /api/clientes
 * - Si email NO existe -> CREA. 201 { action:'created', data: {...} }
 * - Si email YA existe -> ACTUALIZA SOLO: destino/paquete, numero_personas, fecha_viaje, comentarios. 200 { action:'updated', data: {...} }
 *   (No cambia 'nombre' ni 'email')
 */
export async function crearCliente(req, res) {
  try {
    const { nombre, email, destino, numero_personas, fecha_viaje, comentarios, paquete_id } = req.body ?? {};
    // Validaciones comunes
    if (!email || !numero_personas || !fecha_viaje) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (email, numero_personas, fecha_viaje).'});
    }
    if (!isEmail(email)) return res.status(400).json({ error: 'Email inválido' });
    if (!(Number(numero_personas) > 0)) return res.status(400).json({ error: 'Número de personas inválido' });
    if (!isFutureISO(fecha_viaje)) return res.status(400).json({ error: 'La fecha debe ser futura (YYYY-MM-DD)' });

    // Resuelve paquete/destino coherente
    let paquete = null;
    let destinoFinal = destino ?? null;

    if (paquete_id) {
      paquete = await Paquete.findByPk(Number(paquete_id), { attributes: ['id','titulo'] });
      if (!paquete) return res.status(400).json({ error: 'paquete_id no válido' });
      destinoFinal = paquete.titulo;
    } else if (destino) {
      // Intento de mapear por título
      paquete = await Paquete.findOne({ where: { titulo: destino }, attributes: ['id','titulo'] });
      if (paquete) destinoFinal = paquete.titulo;
    }

    // ¿Existe ya por email?
    const existente = await Cliente.findOne({ where: { email } });

    if (existente) {
      // Solo ACTUALIZA los campos permitidos
      const updateFields = {
        numero_personas: Number(numero_personas),
        fecha_viaje,
        comentarios: comentarios ?? null
      };
      if (paquete) {
        updateFields.paquete_id = paquete.id;
        updateFields.destino = paquete.titulo;
      } else if (destinoFinal) {
        updateFields.destino = destinoFinal;
        updateFields.paquete_id = paquete?.id ?? null;
      }

      await existente.update(updateFields);

      const withPkg = await Cliente.findByPk(existente.id, {
        attributes: ['id','nombre','email','destino','numero_personas','fecha_viaje','comentarios','created_at','paquete_id'],
        include: [{ model: Paquete, attributes: ['id','slug','titulo','precio_mxn','imagen_url'] }]
      });
      return res.status(200).json({ action: 'updated', data: withPkg });
    }

    // Si no existe, CREA (requiere 'nombre' además)
    if (!nombre) return res.status(400).json({ error: 'Falta el nombre para el alta.' });

    const nuevo = await Cliente.create({
      nombre,
      email,
      destino: destinoFinal ?? 'Sin paquete',
      paquete_id: paquete?.id ?? null,
      numero_personas: Number(numero_personas),
      fecha_viaje,
      comentarios: comentarios ?? null
    });

    const withPkg = await Cliente.findByPk(nuevo.id, {
      attributes: ['id','nombre','email','destino','numero_personas','fecha_viaje','comentarios','created_at','paquete_id'],
      include: [{ model: Paquete, attributes: ['id','slug','titulo','precio_mxn','imagen_url'] }]
    });

    return res.status(201).json({ action: 'created', data: withPkg });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
