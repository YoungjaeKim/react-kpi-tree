import express from 'express';
import { 
    getGraphs,
    getNodes, 
    upsertNode,
    upsertEdge, 
    getNode,
    createGroup,
    deleteEdge
} from '../controllers/graph';

const router = express.Router();

router.get('/', getGraphs);
router.get('/node', getNodes);
router.get('/node/:id', getNode);
router.post('/node', upsertNode);
router.post('/edge', upsertEdge);
router.post('/group', createGroup);
router.delete('/edge/:id', deleteEdge);

export default router;

module.exports = router;