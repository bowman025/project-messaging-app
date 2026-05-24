import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { searchUsers } from '../controllers/userController.js';

const router = Router();

router.use(authenticate);

router.get('/search', searchUsers);

export default router;
