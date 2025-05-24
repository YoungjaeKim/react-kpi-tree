import { Router } from 'express';
import { upsertConnectionByElementId, getConnectionByElementId, getConnectionById, updateConnection, getConnectionSpec, getConnectionStatuses } from '../controllers/external-connections';

const router = Router();

router.get('/', getConnectionByElementId);
router.get('/spec', getConnectionSpec);
router.get('/status', getConnectionStatuses);
router.get('/:id', getConnectionById);
router.post('/', upsertConnectionByElementId);
router.post('/:id', updateConnection);

export default router;
