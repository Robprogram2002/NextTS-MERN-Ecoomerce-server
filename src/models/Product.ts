import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

export const brandsArray = ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'ASUS'];
export const colorsArray = ['Black', 'Brown', 'Silver', 'White', 'Blue'];

export interface ProductInterface {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  subs: string[];
  quantity: number;
  sold: number;
  images: string[];
  shipping: string;
  color: string;
  brand: string;
  ratings: [
    {
      star: number;
      postedBy: string;
    }
  ];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50,
      text: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
      text: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      maxlength: 32,
    },
    category: {
      type: ObjectId,
      ref: 'Category',
    },
    subs: [
      {
        type: ObjectId,
        ref: 'Sub',
      },
    ],
    quantity: Number,
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
    },
    shipping: {
      type: String,
      enum: ['Yes', 'No'],
    },
    color: {
      type: String,
      enum: colorsArray,
    },
    brand: {
      type: String,
      enum: brandsArray,
    },
    ratings: [
      {
        star: Number,
        postedBy: { type: ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

export default model<ProductInterface>('Product', productSchema);
