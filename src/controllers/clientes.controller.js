import { Cliente } from '../models/cliente.model.js';
import { Paquete } from '../models/paquete.model.js';
import { isEmail, isFutureISO } from '../utils/validate.js';

export async function listarClientes(_req, res) {
  const rows = await Cliente.findAll({
    order: [['id','DESC']],
    attributes: ['id','nombre','email','destino','numero_personas','fecha_viaje','comentarios','created_at','paquete_id'],
    include: [{
      model: Paquete,
      attributes: ['id','slug','titulo','precio_mxn','imagen_url']
    }]
  });
  res.json(rows);
}

export async function crearCliente(req, res) {
  try {
    const { nombre, email, destino, numero_personas, fecha_viaje, comentarios, paquete_id } = req.body ?? {};
    if (!nombre || !email || !numero_personas || !fecha_viaje)
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    if (!isEmail(email)) return res.status(400).json({ error: 'Email inválido' });
    if (!(Number(numero_personas) > 0)) return res.status(400).json({ error: 'Número de personas inválido' });
    if (!isFutureISO(fecha_viaje)) return res.status(400).json({ error: 'La fecha debe ser futura (YYYY-MM-DD)' });

    let paquete = null;
    let destinoFinal = destino ?? null;

    if (paquete_id) {
      paquete = await Paquete.findByPk(Number(paquete_id), { attributes: ['id','titulo'] });
      if (!paquete) return res.status(400).json({ error: 'paquete_id no válido' });
      destinoFinal = paquete.titulo;
    } else if (destino) {
      // Si viene "destino" (texto), intentamos mapearlo a un paquete por título 
      paquete = await Paquete.findOne({
        where: { titulo: destino }
      });
    }

    const nuevo = await Cliente.create({
      nombre,
      email,
      destino: destinoFinal ?? 'Sin paquete',
      paquete_id: paquete?.id ?? null,
      numero_personas: Number(numero_personas),
      fecha_viaje,
      comentarios: comentarios ?? null
    });

    // Incluye paquete en respuesta (comodidad para el front)
    const withPkg = await Cliente.findByPk(nuevo.id, {
      attributes: ['id','nombre','email','destino','numero_personas','fecha_viaje','comentarios','created_at','paquete_id'],
      include: [{ model: Paquete, attributes: ['id','slug','titulo','precio_mxn','imagen_url'] }]
    });

    res.status(201).json(withPkg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
