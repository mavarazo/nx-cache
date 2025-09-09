import { Router } from 'express';
import { getRecord, saveRecord } from '../controllers/cache';
import { authForRead, authForWrite } from '../middlewares/auth';

const router = Router();

router.get('/:hash', authForRead, getRecord);
router.put('/:hash', authForWrite, saveRecord);

export default router;
