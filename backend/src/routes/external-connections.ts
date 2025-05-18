import { Router } from 'express';
import { createConnection, getConnections, getConnectionById, updateConnection } from '../controllers/external-connections';

const router = Router();

router.post('/', createConnection);
router.get('/', getConnections);
router.get('/:id', getConnectionById);
router.post('/:id', updateConnection);

export default router;
