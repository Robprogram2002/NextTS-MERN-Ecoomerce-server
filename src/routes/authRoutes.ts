import { Router } from 'express';
import { body } from 'express-validator';
import isAuth from '../middlewares/isAuth';
import {
  signUpHandler,
  signinHandler,
  meRequestHandler,
  logoutRequest,
} from '../controllers/authController';

const router = Router();

router.post(
  '/sign-up',
  [
    body('email')
      .isEmail()
      .withMessage('enter a valid email address')
      .trim()
      .withMessage('A valid email address is needed'),
    // body('password')
    //   .notEmpty()
    //   .isString()
    //   .trim()
    //   .isLength({ max: 50, min: 8 })
    //   .withMessage('password must be at least 8 characters long'),
    body('username')
      .isString()
      .trim()
      .isLength({ max: 50, min: 3 })
      .withMessage('username must be at least 3 characters long'),
  ],
  signUpHandler
);
router.post('/sign-in', signinHandler);
router.get('/me', isAuth, meRequestHandler);
router.get('/logout', logoutRequest);

export default router;
