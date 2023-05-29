const express = require('express');
const router = express.Router();
const elementController = require("../controllers/element");

router.post('/elements', elementController.createElement);
router.get('/elements', elementController.getElements);
router.get('/elements/:id', elementController.getElementById);
router.post('/element-records', elementController.createElementRecords);
router.get('/element-records', elementController.getElementRecords);

module.exports = router;
