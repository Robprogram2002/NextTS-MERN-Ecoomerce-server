import { Router } from 'express';
import {
  addProduct,
  applyCouponToUserCart,
  changeProductColor,
  emptyCart,
  getUserCart,
  saveAddress,
  changeProductCount,
  removeProduct,
  createPaymentIntent,
  createOrder,
} from '../controllers/cartController';
import { listUserOrders } from '../controllers/authController';
import isAuth from '../middlewares/isAuth';

const router = Router();

router.post('/add-product', isAuth, addProduct);
router.post('/create-order', isAuth, createOrder);
router.patch('/apply-coupon', isAuth, applyCouponToUserCart);
router.patch('/empty', isAuth, emptyCart);
router.patch('/products/change-color', isAuth, changeProductColor);
router.patch('/products/change-count', isAuth, changeProductCount);
router.patch('/products/remove', isAuth, removeProduct);
router.post('/add-address', isAuth, saveAddress);
router.post('/payment-intent', isAuth, createPaymentIntent);
router.get('/orders', isAuth, listUserOrders);
router.get('/', isAuth, getUserCart);

export default router;
