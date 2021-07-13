import { Router } from 'express';
import isAuth from '../middlewares/isAuth';
import {
  signUpHandler,
  signinHandler,
  meRequestHandler,
  logoutRequest,
} from '../controllers/authController';

const router = Router();

router.post('/sign-up', signUpHandler);
router.post('/sign-in', signinHandler);
router.get('/me', isAuth, meRequestHandler);
router.get('/logout', logoutRequest);

export default router;
