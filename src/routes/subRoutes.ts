import { Router } from 'express';

// middlewares
import isAdmin from '../middlewares/isAdmin';
import isAuth from '../middlewares/isAuth';

// controller
import {
  create,
  read,
  update,
  remove,
  list,
  getProductsBySub,
} from '../controllers/subController';

const router = Router();

// routes
router.post('/create', isAuth, isAdmin, create);
router.get('/list', list);
router.get('/:slug', read);
router.get('/:slug/products', getProductsBySub);
router.put('/update/:slug', isAuth, isAdmin, update);
router.delete('/remove/:slug', isAuth, isAdmin, remove);

export default router;
