import { Request, Response, NextFunction } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = res.locals;

    if (!user) throw new Error('User not authenticated');

    if (user.role !== 'admin') {
      throw new Error('Admin resource. Access denied.');
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};
