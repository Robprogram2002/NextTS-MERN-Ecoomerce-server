import { Request, Response } from 'express';
import slugify from 'slugify';
import { validationResult } from 'express-validator';
import Product from '../models/Product';
import Subcategory from '../models/Subcategory';
import HttpException from '../utils/HttpException';
import errorHandler from '../utils/ErrorHandler';

export const create = async (req: Request, res: Response) => {
  try {
    const { name, parent } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    res.json(
      await new Subcategory({ name, parent, slug: slugify(name) }).save()
    );
  } catch (err) {
    errorHandler(err, res);
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const subcategories = await Subcategory.find({})
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(subcategories);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const read = async (req: Request, res: Response) => {
  try {
    const sub = await Subcategory.findOne({ slug: req.params.slug }).lean();
    res.status(200).json(sub);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const update = async (req: Request, res: Response) => {
  const { name, parent } = req.body;
  try {
    const sub = await Subcategory.updateOne(
      { slug: req.params.slug },
      {
        name,
        slug: slugify(name),
        parent,
      },
      {
        new: true,
      }
    );

    res.status(200).json(sub);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const sub = await Subcategory.findOne({ slug: req.params.slug });
    await sub.remove();

    res.status(200).json({ message: 'Sub category removed correctly' });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const getProductsBySub = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const sub = await Subcategory.findOne({ slug })
      .select(['_id', 'name'])
      .lean();

    const products = await Product.find({ subs: sub._id }).lean();

    res.status(200).json({ products, sub });
  } catch (error) {
    errorHandler(error, res);
  }
};
