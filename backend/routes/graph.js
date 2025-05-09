const express = require('express');
const router = express.Router();
const graphController = require("../controllers/graph");

// Group routes
router.post('/group', graphController.createGroup);

// Node routes
router.post('/node', graphController.upsertNode);
router.get('/node', graphController.getNodes);
router.get('/node/:id', graphController.getNodeById);

// Edge routes
router.post('/edge', graphController.upsertEdge);

// Graph routes
router.get('/', graphController.getNodeAndEdge);

module.exports = router;
