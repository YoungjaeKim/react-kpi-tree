import express from 'express';
import { getElements, createElement } from '../controllers/element';

const router = express.Router();

router.get('/', getElements);
router.post('/', createElement);

export default router; 