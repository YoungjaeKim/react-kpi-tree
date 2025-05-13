import express from 'express';
import { 
    getElementRecords, 
    createElementRecord, 
    getElementRecordsByElementId 
} from '../controllers/elementRecord';

const router = express.Router();

router.get('/', getElementRecords);
router.post('/', createElementRecord);
router.get('/:elementId', getElementRecordsByElementId);

export default router; 