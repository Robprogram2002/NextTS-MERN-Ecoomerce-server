import { Response } from 'express';
import HttpException from './HttpException';

export default (error: HttpException, res: Response) => {
  const resObject = {
    status: error.status || 500,
    message: error.message || 'Something went wrong',
    data: null,
  };

  if (error.data) resObject.data = error.data;

  res.status(resObject.status).json(resObject);
};
