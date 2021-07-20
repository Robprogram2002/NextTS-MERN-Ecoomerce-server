import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import Product from '../models/Product';
import Subcategory from '../models/Subcategory';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, parent } = req.body;
    res.json(
      await new Subcategory({ name, parent, slug: slugify(name) }).save()
    );
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subcategories = await Subcategory.find({})
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(subcategories);
  } catch (error) {
    next(error);
  }
};

export const read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await Subcategory.findOne({ slug: req.params.slug }).exec();
    res.status(200).json(sub);
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, parent } = req.body;
  try {
    const sub = await Subcategory.findOne({ slug: req.params.slug });
    sub.set('name', name);
    sub.set('parent', parent);
    sub.set('slug', slugify(name));

    await sub.save();

    res.status(200).json(sub);
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sub = await Subcategory.findOne({ slug: req.params.slug });
    await sub.remove();

    res.status(200).json({ message: 'Sub category removed correctly' });
  } catch (err) {
    next(err);
  }
};

export const getProductsBySub = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const sub = await Subcategory.findOne({ slug })
      .select(['_id', 'name'])
      .lean();

    const products = await Product.find({ subs: sub._id }).lean();

    res.status(200).json({ products, sub });
  } catch (error) {
    next(error);
  }
};
