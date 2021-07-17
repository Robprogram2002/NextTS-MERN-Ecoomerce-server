import { Request, Response, NextFunction } from 'express';
import cloudinary from 'cloudinary';

// config
cloudinary.v2.config({
  cloud_name: 'dhpjmkudq',
  api_key: '584216791199933',
  api_secret: 'oSSoh3Wmc9MhDpuCOodnHwl_KbI',
  secure: true,
});

// req.files.file.path
export const upload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    console.log(error);
    next(error);
  }
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.body;
    cloudinary.v2.uploader.destroy(publicId, (err) => {
      if (err) throw err;
      res.status(200).json({ message: 'Image deleted correctly' });
    });
  } catch (error) {
    next(error);
  }
};
