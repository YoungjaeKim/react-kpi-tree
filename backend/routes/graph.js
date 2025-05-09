const express = require('express');
const router = express.Router();
const graphController = require("../controllers/graph");

router.post('/group', graphController.createGroup);
router.post('/node', graphController.upsertNode);
router.post('/edge', graphController.upsertEdge);
router.get('/', graphController.getNodeAndEdge);
router.get('/node', graphController.getNodes);
router.get('/:id', graphController.getNodeById);

module.exports = router;
