import { Router } from 'express';
import { body } from 'express-validator';
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
const subValidator = [
  body('name')
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage('name must be at least 3 characters long'),
  body('parent').isString().notEmpty().withMessage('parent field is required'),
];

// routes
router.post('/create', subValidator, isAuth, isAdmin, create);
router.get('/list', list);
router.get('/:slug', read);
router.get('/:slug/products', getProductsBySub);
router.put('/update/:slug', subValidator.pop(), isAuth, isAdmin, update);
router.delete('/remove/:slug', isAuth, isAdmin, remove);

export default router;
