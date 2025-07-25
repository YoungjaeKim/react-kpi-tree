import { Router } from 'express';
import { upsertConnectionByElementId, getConnectionByElementId, getConnectionById, updateConnection, getConnectionSpec, getConnectionStatuses, validateConnection, getConnectionsHandler } from '../controllers/external-connections';
import {tableauAuth, tableauViews} from "../controllers/tableau-api";

const router = Router();

router.get('/', getConnectionsHandler);
router.get('/list', getConnectionSpec);
router.get('/status', getConnectionStatuses);
router.get('/:id', getConnectionById);
router.post('/', upsertConnectionByElementId);
router.post('/validate', validateConnection);
router.post('/:id', updateConnection);
router.post('/tableau/auth', tableauAuth);
router.post('/tableau/views', tableauViews);

export default router;
