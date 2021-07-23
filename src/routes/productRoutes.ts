import { Router } from 'express';

// middlewares
import { body } from 'express-validator';
import { brandsArray, colorsArray } from '../models/Product';
import isAdmin from '../middlewares/isAdmin';
import isAuth from '../middlewares/isAuth';
import cache from '../redisConfig';
// controller
import {
  create,
  listAll,
  remove,
  read,
  update,
  selectedProductsHandler,
  getRelatedProducts,
  rateProductHandler,
  searchFilters,
} from '../controllers/productController';

const router = Router();

const productValidator = [
  body('title')
    .isString()
    .trim()
    .isLength({ max: 100, min: 4 })
    .withMessage('title must have at least 4 characters long'),
  body('description')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('field is required'),
  body('price').isNumeric().notEmpty().withMessage('field is required'),
  body('category').isString().notEmpty().withMessage('field is required'),
  body('quantity')
    .isInt({ min: 0, gt: -1 })
    .withMessage('quantity must be a positive integer'),
  body('shipping')
    .isIn(['Yes', 'No'])
    .withMessage('shipping value must be Yes or No '),
  body('color').isIn(colorsArray),
  body('brand').isIn(brandsArray),
  body('images')
    .isArray({ min: 1, max: 10 })
    .withMessage('product mas have at least one image'),
];

// routes
router.post('/create', productValidator, isAuth, isAdmin, create);
router.get(
  '/selected',
  cache.route({
    expire: 60 * 10,
    name: 'selected-products',
  }),
  selectedProductsHandler
);
router.get(
  '/list/:count',
  cache.route({ expire: 60, name: 'list-all-products' }),
  listAll
); // products/100
router.delete('/remove/:slug', isAuth, isAdmin, remove);
router.put('/update/:slug', productValidator, isAuth, isAdmin, update);
router.patch(
  '/rate/:productId',
  [
    body('star')
      .notEmpty()
      .isFloat({ min: 0, max: 5 })
      .withMessage('star must be a float number between 0 and 5'),
  ],
  isAuth,
  rateProductHandler
);
router.get(
  '/:slug',

  // middleware to define cache name
  (req, res, next) => {
    // set cache name
    res.express_redis_cache_name = `product-${req.params.slug}`;
    next();
  },
  cache.route({ expire: 60 * 2 }),
  read
);
router.get('/:productId/relates', getRelatedProducts);
router.post('/search/filters', searchFilters);

export default router;
