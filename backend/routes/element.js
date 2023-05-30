const express = require('express');
const router = express.Router();
const elementController = require("../controllers/element");

router.post('/', elementController.createElement);
router.get('/', elementController.getElements);
router.get('/:id', elementController.getElementById);

module.exports = router;
