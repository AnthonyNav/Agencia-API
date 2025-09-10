import { Router } from 'express';
import { listarPaquetes, obtenerPaquete } from '../controllers/paquetes.controller.js';
const router = Router();

router.get('/', listarPaquetes);
router.get('/:idOrSlug', obtenerPaquete);

export default router;
