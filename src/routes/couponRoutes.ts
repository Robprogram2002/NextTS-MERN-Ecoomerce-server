import { Router } from 'express';
// middlewares
import isAuth from '../middlewares/isAuth';
import isAdmin from '../middlewares/isAdmin';

// controller
import { create, list, remove } from '../controllers/couponController';

const router = Router();

// routes
router.post('/create', isAuth, isAdmin, create);
router.get('/list', list);
router.delete('/remove/:couponId', isAuth, isAdmin, remove);

export default router;
