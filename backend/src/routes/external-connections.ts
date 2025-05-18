import { Router } from 'express';
import { createConnection, getConnections, getConnectionById } from '../controllers/external-connections';

const router = Router();

router.post('/connections', createConnection);
router.get('/connections', getConnections);
router.get('/connections/:id', getConnectionById);

export default router;
