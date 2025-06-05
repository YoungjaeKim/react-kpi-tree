import { Router } from 'express';
import { upsertConnectionByElementId, getConnectionByElementId, getConnectionById, updateConnection, getConnectionSpec, getConnectionStatuses } from '../controllers/external-connections';
import {tableauAuth, tableauViews} from "../controllers/tableau-api";

const router = Router();

router.get('/', getConnectionByElementId);
router.get('/spec', getConnectionSpec);
router.get('/status', getConnectionStatuses);
router.get('/:id', getConnectionById);
router.post('/', upsertConnectionByElementId);
router.post('/:id', updateConnection);
router.post('/tableau/auth', tableauAuth);
router.post('/tableau/views', tableauViews);

export default router;
