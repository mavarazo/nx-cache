import { Router } from 'express';
import { getRecord, saveRecord } from '../controllers/cache';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/:hash', getRecord);
router.put('/:hash', authenticate, saveRecord);

export default router;
