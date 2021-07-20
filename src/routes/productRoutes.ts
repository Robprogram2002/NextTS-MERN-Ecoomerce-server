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
  selectedProductsHandler,
  getRelatedProducts,
  rateProductHandler,
  searchFilters,
} from '../controllers/productController';

const router = Router();

// routes
router.post('/create', isAuth, isAdmin, create);
router.get('/selected', selectedProductsHandler);
router.get('/list/:count', listAll); // products/100
router.delete('/remove/:slug', isAuth, isAdmin, remove);
router.put('/update/:slug', isAuth, isAdmin, update);
router.patch('/rate/:productId', isAuth, rateProductHandler);
router.get('/:slug', read);
router.get('/:productId/relates', getRelatedProducts);
router.post('/search/filters', searchFilters);

export default router;
