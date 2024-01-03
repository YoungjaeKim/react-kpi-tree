const express = require('express');
const router = express.Router();
const graphController = require("../controllers/graph");

router.post('/node', graphController.upsertNode);
router.post('/edge', graphController.upsertEdge);
router.get('/', graphController.getNodeAndEdge);
router.get('/:id', graphController.getNodeById);

module.exports = router;
