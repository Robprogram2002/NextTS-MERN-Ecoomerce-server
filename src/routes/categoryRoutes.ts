import { Router } from 'express';

import {
  create,
  read,
  update,
  remove,
  list,
  getSubcategories,
} from '../controllers/categoryController';

import isAuth from '../middlewares/isAuth';
import isAdmin from '../middlewares/isAdmin';

const router = Router();

// routes
router.post('/create', isAuth, isAdmin, create);
router.get('/list', list);
router.get('/:slug', read);
router.get('/:_id/subs', getSubcategories);
router.put('/update/:slug', isAuth, isAdmin, update);
router.delete('/delete/:slug', isAuth, isAdmin, remove);

export default router;
