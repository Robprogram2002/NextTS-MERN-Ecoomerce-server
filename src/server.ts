import express, { Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import subRoutes from './routes/subRoutes';
import productRoutes from './routes/productRoutes';
import imageRoutes from './routes/imageRoutes';

dotenv.config();

// app
const app = express();

// middlewares
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
  })
);

// routes middleware
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subs', subRoutes);
app.use('/api/products', productRoutes);
app.use('/api/images', imageRoutes);

app.use((error: Error, req: Request, res: Response) => {
  // const status = error.status || 500;
  const message = error.message || 'something went wrong';
  res.status(500).json(message);
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
  // db
  mongoose
    .connect(process.env.DATABASE_URI!, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('DB CONNECTED'))
    .catch((err) => console.log('DB CONNECTION ERR', err));
});
