const express = require('express');
const router = express.Router();
const elementController = require("../controllers/element");

router.post('/', graphController.createElement);
router.get('/', graphController.getElements);

module.exports = router;
