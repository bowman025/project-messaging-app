import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getUploadSignature } from '../controllers/uploadController.js';

const router = Router();

router.use(authenticate);
router.get('/signature', getUploadSignature);

export default router;
