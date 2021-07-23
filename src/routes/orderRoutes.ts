import { Router } from 'express';

import isAuth from '../middlewares/isAuth';
import isAdmin from '../middlewares/isAdmin';

import { getAll, update } from '../controllers/orderController';

const router = Router();

router.get('/all', isAuth, isAdmin, getAll);
router.patch('/update', isAuth, isAdmin, update);

export default router;
