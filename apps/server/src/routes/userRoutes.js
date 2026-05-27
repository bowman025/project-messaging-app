import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { searchUsers, getProfile, patchProfile } from '../controllers/userController.js';

const router = Router();

router.use(authenticate);

router.get('/search', searchUsers);
router.get('/profile', getProfile);
router.patch('/profile', patchProfile);

export default router;
