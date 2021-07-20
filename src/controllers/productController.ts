/* eslint-disable no-underscore-dangle */
import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import { UserInterface } from '../models/User';
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

    const {
      name,
      title,
      images,
      description,
      color,
      brand,
      price,
      shipping,
      quantity,
      category,
      subs,
    } = req.body;

    const product = await Product.findOne({ slug: req.params.slug });
    product.set('name', name);
    product.set('title', title);
    if (req.body.images) {
      product.set('images', images);
    }
    product.set('description', description);
    product.set('slug', req.body.slug);
    product.set('color', color);
    product.set('brand', brand);
    product.set('price', price);
    product.set('shipping', shipping);
    product.set('quantity', quantity);
    product.set('category', category);
    product.set('subs', subs);

    await product.save();

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

export const selectedProductsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // createdAt/updatedAt, desc/asc, 3
    const { sort, order, page } = req.query;
    const currentPage = +page || 1;
    const perPage = 3; // 3

    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .populate('category')
      .populate('subs')
      .sort([[sort, order]])
      .limit(perPage)
      .lean()
      .exec();

    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

// exports.productsCount = async (req, res) => {
//   let total = await Product.find({}).estimatedDocumentCount().exec();
//   res.json(total);
// };

export const rateProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('hereee');

    const authUser: UserInterface = res.locals.user;
    const { productId } = req.params;
    const { star } = req.body;

    const product = await Product.findById(productId).exec();

    // who is updating?
    // check if currently logged in user have already added rating to this product?
    const existingRatingObject = product.ratings.find(
      (ele) => ele.postedBy.toString() === authUser._id.toString()
    );
    // if user haven't left rating yet, push it
    if (existingRatingObject === undefined) {
      product.set('ratings', [
        ...product.ratings,
        { star, postedBy: authUser._id },
      ]);
      await product.save();

      res.status(200).json(product);
    } else {
      // if user have already left rating, update it
      const ratingUpdated = await Product.updateOne(
        {
          ratings: { $elemMatch: existingRatingObject },
        },
        { $set: { 'ratings.$.star': star } },
        { new: true }
      ).exec();

      res.status(200).json(ratingUpdated);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getRelatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.productId)
      .select(['category', '_id'])
      .lean()
      .exec();

    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
    })
      .limit(3)
      .populate('category')
      .populate('subs')
      .populate('postedBy')
      .lean()
      .exec();

    res.status(200).json(related);
  } catch (error) {
    next(error);
  }
};

// SERACH / FILTER

const handleQuery = async (req: Request, res: Response, query: string) => {
  const products = await Product.find({ $text: { $search: query } })
    .populate('category', '_id name')
    .populate('subs', '_id name')
    .populate('postedBy', '_id name')
    .exec();

  res.json(products);
};

const handlePrice = async (req: Request, res: Response, price: number) => {
  try {
    const products = await Product.find({
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    })
      .populate('category', '_id name')
      .populate('subs', '_id name')
      .populate('postedBy', '_id name')
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleCategory = async (
  req: Request,
  res: Response,
  category: string
) => {
  try {
    const products = await Product.find({ category })
      .populate('category', '_id name')
      .populate('subs', '_id name')
      .populate('postedBy', '_id name')
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleStar = (req: Request, res: Response, stars: number) => {
  Product.aggregate([
    {
      $project: {
        document: '$$ROOT',
        // title: "$title",
        floorAverage: {
          $floor: { $avg: '$ratings.star' }, // floor value of 3.33 will be 3
        },
      },
    },
    { $match: { floorAverage: stars } },
  ])
    .limit(12)
    .exec((error, aggregates) => {
      if (error) console.log('AGGREGATE ERROR', error);
      Product.find({
        _id: {
          $in: aggregates,
        },
      })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('postedBy', '_id name')
        .exec((err, products) => {
          if (err) console.log('PRODUCT AGGREGATE ERROR', err);
          res.json(products);
        });
    });
};

const handleSub = async (req: Request, res: Response, sub: string) => {
  const products = await Product.find({ subs: sub })
    .populate('category', '_id name')
    .populate('subs', '_id name')
    .populate('postedBy', '_id name')
    .exec();

  res.json(products);
};

const handleShipping = async (
  req: Request,
  res: Response,
  shipping: string
) => {
  const products = await Product.find({ shipping })
    .populate('category', '_id name')
    .populate('subs', '_id name')
    .populate('postedBy', '_id name')
    .exec();

  res.json(products);
};

const handleColor = async (req: Request, res: Response, color: string) => {
  const products = await Product.find({ color })
    .populate('category', '_id name')
    .populate('subs', '_id name')
    .populate('postedBy', '_id name')
    .exec();

  res.json(products);
};

const handleBrand = async (req: Request, res: Response, brand: string) => {
  const products = await Product.find({ brand })
    .populate('category', '_id name')
    .populate('subs', '_id name')
    .populate('postedBy', '_id name')
    .exec();

  res.json(products);
};

export const searchFilters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query, price, category, stars, sub, shipping, color, brand } =
    req.body;

  try {
    if (query) {
      console.log('query --->', query);
      await handleQuery(req, res, query);
    }

    // price [20, 200]
    if (price !== undefined) {
      console.log('price ---> ', price);
      await handlePrice(req, res, price);
    }

    if (category) {
      console.log('category ---> ', category);
      await handleCategory(req, res, category);
    }

    if (stars) {
      console.log('stars ---> ', stars);
      await handleStar(req, res, stars);
    }

    if (sub) {
      console.log('sub ---> ', sub);
      await handleSub(req, res, sub);
    }

    if (shipping) {
      console.log('shipping ---> ', shipping);
      await handleShipping(req, res, shipping);
    }

    if (color) {
      console.log('color ---> ', color);
      await handleColor(req, res, color);
    }

    if (brand) {
      console.log('brand ---> ', brand);
      await handleBrand(req, res, brand);
    }
  } catch (error) {
    next(error);
  }
};
