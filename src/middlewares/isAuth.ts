import { Request, Response, NextFunction } from 'express';
import admin from '../firebase';

module.exports = async (req: Request, res: Response, next: NextFunction) => {
  // console.log(req.headers); // token
  const { authResult }: any = req.body;
  const { token } = authResult;

  try {
    const firebaseUser = await admin.auth().verifyIdToken(token);
    res.locals.user = firebaseUser;
    next();
  } catch (err) {
    res.status(401).json({
      err: 'Invalid or expired token',
    });
  }
};
