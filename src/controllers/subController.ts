import { Request, Response } from 'express';
import slugify from 'slugify';
import { validationResult } from 'express-validator';
import Product from '../models/Product';
import Subcategory from '../models/Subcategory';
import HttpException from '../utils/HttpException';
import errorHandler from '../utils/ErrorHandler';
import cache from '../redisConfig';

const removeSubCache = (parentId: string, slug: string | null = null) => {
  cache.del('subcategories', (err) => {
    if (err) throw new HttpException(500, 'problems with redis cache');
  });
  cache.del('categories-subcategories', (err) => {
    if (err) throw new HttpException(500, 'problems with redis cache');
  });

  cache.del(`category-${parentId}-subcategories`, (err) => {
    if (err) throw new HttpException(500, 'problems with redis cache');
  });

  if (slug) {
    cache.del(`subcategory-${slug}-products`, (err) => {
      if (err) throw new HttpException(500, 'problems with redis cache');
    });
  }
};

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

    const newSub = await new Subcategory({
      name,
      parent,
      slug: slugify(name),
    }).save();

    removeSubCache(parent);
    // remove the cache for the parent category
    // since we are adding a new sub

    res.json(newSub);
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

    removeSubCache(parent, slugify(name));

    res.status(200).json(sub);
  } catch (error) {
    errorHandler(error, res);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const sub = await Subcategory.findOne({ slug });
    await sub.remove();

    removeSubCache(sub.parent, slug);

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

    res.status(200).json(products);
  } catch (error) {
    errorHandler(error, res);
  }
};
