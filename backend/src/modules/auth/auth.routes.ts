import { Router } from 'express';
import * as ctrl from './auth.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate, loginSchema, registerSchema } from '../../utils/validators';

const router = Router();

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login',    validate(loginSchema),    ctrl.login);
router.post('/refresh',                            ctrl.refresh);
router.post('/logout',   requireAuth,              ctrl.logout);
router.get('/me',        requireAuth,              ctrl.getMe);

export default router;
