import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const signUpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body;

  try {
    const isTaken = await User.findOne({ email });

    if (isTaken) {
      throw new Error('Adress already taken');
    }

    await User.create({
      username,
      password,
      email,
    });

    res.status(200).json({ message: 'user sign up successfully' });
  } catch (error) {
    next(error);
  }
};

export const signInWithEmailAndPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('user not found');
    }

    console.log(password);

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
