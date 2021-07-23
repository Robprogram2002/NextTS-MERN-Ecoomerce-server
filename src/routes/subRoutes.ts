import { Router } from 'express';
import { body } from 'express-validator';
// middlewares
import isAdmin from '../middlewares/isAdmin';
import isAuth from '../middlewares/isAuth';
import cache from '../redisConfig';

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
const subValidator = [
  body('name')
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage('name must be at least 3 characters long'),
  body('parent').isString().notEmpty().withMessage('parent field is required'),
];

// routes
router.post('/create', subValidator, isAuth, isAdmin, create);
router.get('/list', cache.route('subcategories'), list);
router.get('/:slug', read);
router.get(
  '/:slug/products',
  // middleware to define cache name
  (req, res, next) => {
    res.express_redis_cache_name = `subcategory-${req.params.slug}-products`;
    next();
  },
  cache.route({ expire: 60 }),
  getProductsBySub
);
router.put('/update/:slug', subValidator.pop(), isAuth, isAdmin, update);
router.delete('/remove/:slug', isAuth, isAdmin, remove);

export default router;
