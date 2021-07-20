import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import Product from '../models/Product';
import Category from '../models/Category';
import SubCategory from '../models/Subcategory';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    console.log(name);
    res.json(await new Category({ name, slug: slugify(name) }).save());
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 }).exec();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
    }).exec();
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;
  try {
    const updated = await Category.findOne({ slug: req.params.slug });

    updated.set('name', name);
    updated.set('slug', slugify(name));

    await updated.save();

    res.json(updated);
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
    const category = await Category.deleteOne({ slug: req.params.slug });
    console.log(category);
    res.status(200).json({ message: 'category deleted' });
  } catch (err) {
    next(err);
  }
};

export const getSubcategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id } = req.params;
    const subcategories = await SubCategory.find({ parent: _id });
    res.status(200).json(subcategories);
  } catch (error) {
    next(error);
  }
};

export const getProductsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug })
      .select(['_id', 'name'])
      .lean();
    const products = await Product.find({ category: category._id })
      .populate('category')
      .lean();

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};
