const express = require('express');
const router = express.Router();
const elementRecordController = require("../controllers/elementRecord");

// Type-specific routes
router.post('/integer', elementRecordController.createIntegerRecord);
router.get('/integer', elementRecordController.getIntegerRecords);
router.get('/integer/:id', elementRecordController.getIntegerRecordById);

router.post('/double', elementRecordController.createDoubleRecord);
router.get('/double', elementRecordController.getDoubleRecords);
router.get('/double/:id', elementRecordController.getDoubleRecordById);

router.post('/string', elementRecordController.createStringRecord);
router.get('/string', elementRecordController.getStringRecords);
router.get('/string/:id', elementRecordController.getStringRecordById);

module.exports = router;
