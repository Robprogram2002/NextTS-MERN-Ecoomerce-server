import { Router } from 'express';
import { body } from 'express-validator';
import {
  create,
  read,
  update,
  remove,
  list,
  getSubcategories,
  getProductsByCategory,
} from '../controllers/categoryController';

import isAuth from '../middlewares/isAuth';
import isAdmin from '../middlewares/isAdmin';

const router = Router();
const categoryValidator = [
  body('name')
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage('name is required and must be at least 3 characters long'),
];

// routes
router.post('/create', categoryValidator, isAuth, isAdmin, create);
router.get('/list', list);
router.get('/:slug', read);
router.get('/:slug/products', getProductsByCategory);
router.get('/:_id/subs', getSubcategories);
router.put('/update/:slug', categoryValidator, isAuth, isAdmin, update);
router.delete('/delete/:slug', isAuth, isAdmin, remove);

export default router;
