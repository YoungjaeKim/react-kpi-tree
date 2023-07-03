const express = require('express');
const router = express.Router();
const graphController = require("../controllers/graph");

router.post('/', graphController.getNodeAndEdge);
router.post('/:id', graphController.getNodeById);

module.exports = router;
