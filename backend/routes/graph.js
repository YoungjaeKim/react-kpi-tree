const express = require('express');
const router = express.Router();
const graphController = require("../controllers/graph");

router.post('/node', graphController.upsertNodes);
router.post('/edge', graphController.upsertEdges);
router.get('/', graphController.getNodeAndEdge);
router.get('/:id', graphController.getNodeById);

module.exports = router;
