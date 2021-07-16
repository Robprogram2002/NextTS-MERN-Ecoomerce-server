import { Request, Response, NextFunction } from 'express';
import cloudinary from 'cloudinary';

// config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// req.files.file.path
export const upload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.body.image, {
      public_id: `${Date.now()}`,
      resource_type: 'auto', // jpeg, png
    });

    console.log(result);

    res.status(200).json({
      public_id: result.public_id,
      url: result.secure_url,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.body;

    cloudinary.v2.uploader.destroy(publicId, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.status(200).json({ message: 'Image deleted correctly' });
    });
  } catch (error) {
    next(error);
  }
};
