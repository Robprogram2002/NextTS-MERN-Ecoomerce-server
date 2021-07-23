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
  getAllHandler,
} from '../controllers/categoryController';

import isAuth from '../middlewares/isAuth';
import isAdmin from '../middlewares/isAdmin';
import cache from '../redisConfig';

const router = Router();
const categoryValidator = [
  body('name')
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage('name is required and must be at least 3 characters long'),
];

// routes
router.post('/create', categoryValidator, create);
router.get('/all', cache.route('categories-subcategories'), getAllHandler);
router.get('/list', cache.route('categories'), list);
router.get('/:slug', read);
router.get(
  '/:slug/products',
  // middleware to define cache name
  (req, res, next) => {
    // set cache name
    res.express_redis_cache_name = `category-${req.params.slug}-products`;
    next();
  },
  cache.route({ expire: 60 }),
  getProductsByCategory
);
router.get(
  '/:_id/subs',
  // middleware to define cache name
  (req, res, next) => {
    // set cache name
    res.express_redis_cache_name = `category-${req.params._id}-subcategories`;
    next();
  },
  cache.route(),
  getSubcategories
);
router.put('/update/:slug', categoryValidator, isAuth, isAdmin, update);
router.delete('/delete/:slug', isAuth, isAdmin, remove);

export default router;
