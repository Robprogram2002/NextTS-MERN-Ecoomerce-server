import { Request, Response, NextFunction } from 'express';
import cookie from 'cookie';
import User from '../models/User';
import admin from '../firebase';

export const signUpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email } = req.body;

  try {
    const isTaken = await User.findOne({ email });

    if (isTaken) {
      throw new Error('Adress already taken');
    }

    await User.create({
      username,
      email,
    });

    res.status(200).json({ message: 'user sign up successfully' });
  } catch (error) {
    next(error);
  }
};

export const signinHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authResult }: any = req.body;
    const { token } = authResult;
    const firebaseUser = await admin.auth().verifyIdToken(token);

    // if not user, create one in DB
    let user = await User.findOne({ email: firebaseUser.email });

    if (!user) {
      user = await User.create({
        email: firebaseUser.email,
        username: firebaseUser.name,
        photoUrl: firebaseUser.picture,
      });
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
    next(error);
  }
};

export const meRequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = res.locals;

    if (!user) throw new Error('Not user authenticated');

    res.status(200).json({ user });
  } catch (error) {
    next(error);
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
