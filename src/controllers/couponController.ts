import { Request, Response, NextFunction } from 'express';
import Coupon from '../models/Coupon';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, expiry, discount } = req.body;
    const coupon = await new Coupon({ name, expiry, discount }).save();
    res.status(200).json(coupon);
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const coupon = await Coupon.findById(req.params.couponId);
    await coupon.remove();

    res.status(200).json({ message: 'coupon removed correctly' });
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json(coupons);
  } catch (err) {
    next(err);
  }
};
