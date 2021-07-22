import { Request, Response } from 'express';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import errorHandler from '../utils/ErrorHandler';

dotenv.config();

// config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// req.files.file.path
export const upload = async (req: Request, res: Response) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.body.image, {
      public_id: `next-ecomm/products/${Date.now()}`,
      resource_type: 'auto', // jpeg, png
    });

    res.status(200).json({
      public_id: result.public_id,
      url: result.secure_url,
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

export const remove = (req: Request, res: Response) => {
  try {
    const { publicId } = req.body;
    cloudinary.v2.uploader.destroy(publicId, (err) => {
      if (err) throw err;
      res.status(200).json({ message: 'Image deleted correctly' });
    });
  } catch (error) {
    errorHandler(error, res);
  }
};
