import express from 'express';
import {
    getGraphs,
    getNodes,
    upsertNode,
    upsertEdge,
    getNodeById,
    createGroup,
    deleteEdge,
    getGroupById,
    getGroups,
    updateGroup
} from '../controllers/graph';

const router = express.Router();

router.get('/', getGraphs);
router.get('/node', getNodes);
router.get('/node/:id', getNodeById);
router.get('/group', getGroups);
router.get('/group/:id', getGroupById);
router.post('/group', createGroup);
router.post('/group/:id', updateGroup);
router.post('/node', upsertNode);
router.post('/edge', upsertEdge);
router.delete('/edge/:id', deleteEdge);

export default router;

module.exports = router;