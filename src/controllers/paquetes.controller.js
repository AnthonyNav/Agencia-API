import { Paquete } from '../models/paquete.model.js';
import { Op } from 'sequelize';

export async function listarPaquetes(_req, res) {
  const rows = await Paquete.findAll({
    order: [['id', 'ASC']],
    attributes: ['id','slug','titulo','destino','duracion_dias','duracion_noches','incluye','precio_mxn','imagen_url']
  });
  res.json(rows);
}

export async function obtenerPaquete(req, res) {
  const { idOrSlug } = req.params;
  const where = Number.isInteger(+idOrSlug)
    ? { id: Number(idOrSlug) }
    : { slug: { [Op.eq]: idOrSlug } };

  const row = await Paquete.findOne({
    where,
    attributes: ['id','slug','titulo','destino','duracion_dias','duracion_noches','incluye','precio_mxn','imagen_url','politicas']
  });
  if (!row) return res.status(404).json({ error: 'Paquete no encontrado' });
  res.json(row);
}
