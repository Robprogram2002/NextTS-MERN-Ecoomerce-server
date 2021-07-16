import { Router } from 'express';

// middlewares
import isAdmin from '../middlewares/isAdmin';
import isAuth from '../middlewares/isAuth';

// controller
import {
  create,
  listAll,
  remove,
  read,
  update,
} from '../controllers/productController';

const router = Router();

// routes
router.post('/create', isAuth, isAdmin, create);
router.get('/list/:count', listAll); // products/100
router.delete('/remove/:slug', isAuth, isAdmin, remove);
router.get('/:slug', read);
router.put('/update/:slug', isAuth, isAdmin, update);

export default router;
