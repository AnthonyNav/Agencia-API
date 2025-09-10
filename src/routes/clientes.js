import { Router } from 'express';
import { listarClientes, crearCliente } from '../controllers/clientes.controller.js';

const router = Router();
router.get('/', listarClientes);
router.post('/', crearCliente);

export default router;
