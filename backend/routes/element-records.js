const express = require('express');
const router = express.Router();
const elementRecordController = require("../controllers/elementRecord");

router.post('/', elementRecordController.createElementRecords);
router.get('/', elementRecordController.getElementRecords);

module.exports = router;
