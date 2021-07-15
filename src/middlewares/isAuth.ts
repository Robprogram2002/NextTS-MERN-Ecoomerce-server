import { Request, Response, NextFunction } from 'express';
import admin from '../firebase';
import User from '../models/User';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { token } = req.cookies;

    if (!token) {
      token = req.headers.authorization;
    }

    if (!token) throw new Error('User not authenticated');

    const firebaseUser = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ email: firebaseUser.email });

    res.locals.user = user;

    next();
  } catch (err) {
    res.status(401).json({
      err: 'Invalid or expired token',
    });
  }
};
