import { Request, Response } from 'express';
import cookie from 'cookie';
import { validationResult } from 'express-validator';
import errorHandler from '../utils/ErrorHandler';
import HttpException from '../utils/HttpException';
import User, { UserInterface } from '../models/User';
import admin from '../firebase';
import Order from '../models/Order';

export const signUpHandler = async (req: Request, res: Response) => {
  try {
    const { username, email } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const isTaken = await User.findOne({ email }).select(['_id']).lean();

    if (isTaken) {
      throw new HttpException(400, 'Adress already taken');
    }

    await new User({
      username,
      email,
      cart: {
        products: [],
        totalAmount: 0,
        appliedCoupon: false,
      },
    }).save();

    res.status(200).json({ message: 'user sign up successfully' });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const signinHandler = async (req: Request, res: Response) => {
  try {
    const { authResult }: any = req.body;
    const { token } = authResult;
    const firebaseUser = await admin.auth().verifyIdToken(token);

    // if not user, create one in DB
    let user = await User.findOne({ email: firebaseUser.email });

    if (!user) {
      user = new User({
        email: firebaseUser.email,
        username: firebaseUser.name,
        photoUrl: firebaseUser.picture,
      });

      user.cart = {
        products: [],
        totalAmount: 0,
        appliedCoupon: false,
      };

      await user.save();
    }

    res.set(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3590, // 3600
        path: '/',
      })
    );

    res.status(200).json({ user });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const meRequestHandler = async (req: Request, res: Response) => {
  try {
    const { user } = res.locals;

    if (!user) throw new HttpException(401, 'Not user authenticated');

    res.status(200).json({ user });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const logoutRequest = async (req: Request, res: Response) => {
  res.set(
    'Set-Cookie',
    cookie.serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    })
  );

  res.status(200).json({ message: 'user logout correctly' });
};

export const listUserOrders = async (req: Request, res: Response) => {
  const authUser: UserInterface = res.locals.user;

  try {
    const userOrders = await Order.find({ orderedBy: authUser._id })
      .populate('products.product')
      .lean()
      .exec();

    res.status(200).json(userOrders);
  } catch (error) {
    errorHandler(error, res);
  }
};
