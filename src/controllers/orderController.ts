import { Request, Response } from 'express';
import errorHandler from '../utils/ErrorHandler';
import Order from '../models/Order';

export const getAll = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json(orders);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { status, orderId } = req.body;
    const order = await Order.updateOne(
      { _id: orderId },
      {
        $set: {
          orderStatus: status,
        },
      }
    );

    res.status(200).json(order);
  } catch (error) {
    errorHandler(error, res);
  }
};
