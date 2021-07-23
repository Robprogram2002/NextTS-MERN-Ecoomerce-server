import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import Order from '../models/Order';
import Coupon from '../models/Coupon';
import Product, { ProductInterface } from '../models/Product';
import User, { UserInterface } from '../models/User';
import errorHandler from '../utils/ErrorHandler';
import cache from '../redisConfig';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: '2020-08-27',
});

export const addProduct = async (req: Request, res: Response) => {
  const { product }: { product: ProductInterface } = req.body;
  const authUser: UserInterface = res.locals.user;
  try {
    // const cart = JSON.parse(JSON.stringify(authUser.cart));
    const newCart = { ...authUser.cart };
    const productsId = newCart.products.map((obj) => obj.product.toString());

    if (productsId.includes(product._id.toString())) {
      // the product already exist , update the count
      const index = productsId.findIndex(
        (id) => id.toString() === product._id.toString()
      );
      newCart.products[index].count += 1;
    } else {
      // the product doesn't exist , you have to add it
      newCart.products.push({
        color: product.color,
        count: 1,
        product: product._id,
      });
    }

    // updated the totalAmount
    newCart.totalAmount += product.price;

    // updated the user model
    await User.updateOne(
      { _id: authUser._id },
      {
        $set: {
          cart: newCart,
        },
      }
    );

    // clear user cache
    cache.del('user-me', () => {});

    res.status(200).json(newCart);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const changeProductCount = async (req: Request, res: Response) => {
  const { productId, count } = req.body;
  const authUser: UserInterface = res.locals.user;
  const newCart = { ...authUser.cart };

  try {
    const product = await Product.findById(productId)
      .select(['_id', 'price'])
      .lean();

    const index = newCart.products.findIndex(
      (obj) => obj.product.toString() === productId.toString()
    );
    const oldCount = newCart.products[index].count;
    if (count === 0) {
      // delete the product from the cart
      newCart.products.splice(index, 1);
      newCart.totalAmount -= product.price;
    } else if (count > oldCount) {
      // add one product unit
      newCart.products[index].count += 1;
      newCart.totalAmount += product.price;
    } else if (count < oldCount) {
      // remove one product unit
      newCart.products[index].count -= 1;
      newCart.totalAmount -= product.price;
    }

    // updated the user model
    await User.updateOne(
      { _id: authUser._id },
      {
        $set: {
          cart: newCart,
        },
      }
    );

    const productIds: string[] = newCart.products.map((obj) => obj.product);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    newCart.products = newCart.products.map((obj, i) => ({
      count: newCart.products[i].count,
      product: products[i],
      color: newCart.products[i].color,
    }));

    res.status(200).json(newCart);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const removeProduct = async (req: Request, res: Response) => {
  const { productId } = req.body;
  try {
    const authUser: UserInterface = res.locals.user;
    const newCart = { ...authUser.cart };
    const product = await Product.findById(productId)
      .select(['price', '_id'])
      .lean();

    const index = newCart.products.findIndex(
      (obj) => obj.product === productId
    );
    const deleted = newCart.products.splice(index, 1);

    // updated the totalAmount
    newCart.totalAmount -= product.price * deleted[0].count;

    // updated the user model
    await User.updateOne(
      { _id: authUser._id },
      {
        $set: {
          cart: newCart,
        },
      }
    );

    res.status(200).json(newCart);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const changeProductColor = async (req: Request, res: Response) => {
  const { productId, color } = req.body;

  try {
    const authUser: UserInterface = res.locals.user;
    const newCart = { ...authUser.cart };

    const index = newCart.products.findIndex(
      (obj) => obj.product.toString() === productId.toString()
    );

    newCart[index].color = color;

    // updated the user model
    await User.updateOne(
      { _id: authUser._id },
      {
        $set: {
          cart: newCart,
        },
      }
    );

    res.status(200).json(newCart);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const getUserCart = async (req: Request, res: Response) => {
  try {
    const authUser: UserInterface = res.locals.user;

    const productIds: string[] = authUser.cart.products.map(
      (obj) => obj.product
    );

    const products = await Product.find({
      _id: { $in: productIds },
    }).lean();

    const result = { ...authUser.cart };
    result.products = result.products.map((obj, i) => ({
      count: result.products[i].count,
      product: products[i],
      color: result.products[i].color,
    }));

    res.status(200).json(result);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const emptyCart = async (req: Request, res: Response) => {
  const authUser = res.locals.user;

  try {
    await User.updateOne(
      { _id: authUser._id },
      {
        $set: {
          cart: {
            products: [],
            totalAmount: 0,
            appliedCoupon: authUser.cart.appliedCoupon,
          },
        },
      }
    );

    res.status(200).json({ message: 'Cart cleared correctly' });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const saveAddress = async (req: Request, res: Response) => {
  try {
    await User.updateOne(
      { _id: res.locals.user._id },
      { $set: { adress: req.body.address } }
    );

    res.status(200).json({ message: 'Address saved correctly' });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const applyCouponToUserCart = async (req: Request, res: Response) => {
  const { coupon } = req.body;

  try {
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon === null) {
      throw new Error('Incalid Coupon code');
    }

    const authUser: UserInterface = res.locals.user;
    const cartTotal = authUser.cart.totalAmount;

    // calculate the total after discount
    const totalAfterDiscount = (
      cartTotal -
      (cartTotal * validCoupon.discount) / 100
    ).toFixed(2); // 99.99

    res.status(200).json(totalAfterDiscount);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    // const authUser: UserInterface = res.locals.user;
    const { totalAmount, coupon } = req.body;

    // check if there is coupon
    const validCoupon = await Coupon.findOne({ name: coupon });

    if (validCoupon) {
      // check if the coupon has not expired yet

      const authUser: UserInterface = res.locals.user;
      const cartTotal = authUser.cart.totalAmount;

      // calculate the total after discount
      const totalAfterDiscount = (
        cartTotal -
        (cartTotal * validCoupon.discount) / 100
      ).toFixed(2); // 99.99

      if (totalAfterDiscount !== totalAmount) {
        // client total missmatch , throw an error
        throw new Error('Total amount corrupted');
      }

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(+totalAmount),
        currency: 'usd',
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
        cartTotal,
        totalAfterDiscount,
        payable: +totalAfterDiscount,
      });
    } else {
      // there is no coupon
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(+totalAmount),
        currency: 'usd',
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
        cartTotal: +totalAmount,
        totalAmount: +totalAmount,
      });
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const { paymentIntent } = req.body.stripeResponse;
  const { completeCart } = req.body;

  const authUser: UserInterface = res.locals.user;

  try {
    await new Order({
      products: completeCart.products,
      paymentIntent,
      orderedBy: authUser._id,
    }).save();

    // decrement quantity, increment sold
    const bulkOption = authUser.cart.products.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    }));

    const updated = await Product.bulkWrite(bulkOption, {});
    console.log('PRODUCT QUANTITY-- AND SOLD++', updated);

    res.status(200).json({ ok: true });
  } catch (error) {
    errorHandler(error, res);
  }
};
