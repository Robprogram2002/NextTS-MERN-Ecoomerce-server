import { Request, Response } from 'express';
import slugify from 'slugify';
import { validationResult } from 'express-validator';
import HttpException from '../utils/HttpException';
import errorHandler from '../utils/ErrorHandler';
import Product from '../models/Product';
import Category from '../models/Category';
import SubCategory from '../models/Subcategory';
import cache from '../redisConfig';

const removeCategoryCache = (
  slug: string | null = null,
  _id: string | null = null
) => {
  cache.del('categories', (err) => {
    if (err) throw new HttpException(500, 'problems with redis cache');
  });
  cache.del('categories-subcategories', (err) => {
    if (err) throw new HttpException(500, 'problems with redis cache');
  });

  if (slug) {
    cache.del(`category-${slug}-products`, (err) => {
      if (err) throw new HttpException(500, 'problems with redis cache');
    });
  }

  if (_id) {
    cache.del(`category-${_id}-subcategories`, (err) => {
      if (err) throw new HttpException(500, 'problems with redis cache');
    });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new HttpException(
        400,
        'Bad input data',
        errors.array({ onlyFirstError: true })
      );
    }

    const category = await new Category({ name, slug: slugify(name) }).save();

    // remove the cache for categories red operations
    removeCategoryCache();

    res.status(200).json(category);
  } catch (err) {
    errorHandler(err, res);
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
    res.json(categories);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const read = async (req: Request, res: Response) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
    }).lean();
    res.json(category);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const update = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const updated = await Category.updateOne(
      { slug: req.params.slug },
      {
        name,
        slug: slugify(name),
      },
      { new: true }
    );

    // remove the cache for categories red operations
    removeCategoryCache(slugify(name));

    res.status(200).json(updated);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug }).select(['_id']);
    await category.remove();

    // remove the cache for categories red operations
    removeCategoryCache(slug, category._id);

    res.status(200).json({ message: 'category deleted' });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const getSubcategories = async (req: Request, res: Response) => {
  try {
    const { _id } = req.params;
    const subcategories = await SubCategory.find({ parent: _id }).lean();
    res.status(200).json(subcategories);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
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
    errorHandler(error, res);
  }
};

export const getAllHandler = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({}).lean();
    const subcategories = await SubCategory.find({}).lean();

    if (!categories || !subcategories) {
      throw new HttpException(500, 'An error was happen, plis try again');
    }

    res.status(200).json({
      categories,
      subcategories,
    });
  } catch (error) {
    errorHandler(error, res);
  }
};
