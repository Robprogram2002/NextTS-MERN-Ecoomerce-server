import { Router } from 'express';

import {
  signUpHandler,
  signInWithEmailAndPassword,
} from '../controllers/authController';

const router = Router();

router.post('/sign-up', signUpHandler);
router.post('/sign-in', signInWithEmailAndPassword);

export default router;
