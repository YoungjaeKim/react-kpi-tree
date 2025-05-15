import express from 'express';
import {getElementById, getElements, pushElement} from '../controllers/element';

const router = express.Router();

router.get('/', getElements);
router.get('/:id', getElementById);
router.post('/', pushElement);

export default router; 