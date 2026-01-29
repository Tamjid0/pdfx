import { Router } from 'express';
import * as authController from '../../controllers/authController.js';

const router = Router();

/**
 * @route POST /api/v1/auth/sync
 * @desc Sync Firebase user with MongoDB
 * @access Public (Firebase Token verification can be added later as middleware)
 */
import validate from '../../middleware/validate.js';
import * as authValidation from '../../validations/auth.validation.js';

router.post('/sync', validate(authValidation.sync), authController.syncUser);

export default router;
