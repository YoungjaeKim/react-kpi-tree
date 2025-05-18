import { Router } from 'express';
import { createConnection, getConnections, getConnectionById, updateConnection, getConnectionStatuses } from '../controllers/external-connections';

const router = Router();

router.get('/', getConnections);
router.get('/status', getConnectionStatuses);
router.get('/:id', getConnectionById);
router.post('/', createConnection);
router.post('/:id', updateConnection);

export default router;
