import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import Product from '../models/Product';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.slug = slugify(req.body.title);
    const newProduct = await new Product(req.body).save();
    res.status(200).json(newProduct);
  } catch (err) {
    next(err);
  }
};

export const listAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find({})
      .limit(parseInt(req.params.count, 36))
      .populate('category')
      .populate('subs')
      .sort([['createdAt', 'desc']])
      .lean()
      .exec();

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const deleted = await Product.findOneAndRemove({
    //   slug: req.params.slug,
    // }).exec();

    const product = await Product.findOne({ slug: req.params.slug });
    await product.remove();

    res.status(200).json({ messege: 'product deleted correctly', product });
  } catch (err) {
    next(err);
  }
};

export const read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category')
      .populate('subs')
      .lean()
      .exec();

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const productUpdated = await Product.findOne({ slug: req.params.slug });
    productUpdated.set('name', req.body.name);
    await productUpdated.save();

    res.status(200).json(productUpdated);
  } catch (err) {
    next(err);
  }
};
