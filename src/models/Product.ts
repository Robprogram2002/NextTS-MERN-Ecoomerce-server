import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

enum Colors {
  'Black',
  'Brown',
  'Silver',
  'White',
  'Blue',
}

enum Brands {
  'Apple',
  'Samsung',
  'Microsoft',
  'Lenovo',
  'ASUS',
}

export const brands_array = ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'ASUS'];
export const colors_array = ['Black', 'Brown', 'Silver', 'White', 'Blue'];

interface ProductInterface {
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  subs: string[];
  quantity: number;
  sold: number;
  images: string[];
  shipping: 'Yes' | 'No';
  color: Colors;
  brand: Brands;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
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
      enum: colors_array,
    },
    brand: {
      type: String,
      enum: brands_array,
    },
    // ratings: [
    //   {
    //     star: Number,
    //     postedBy: { type: ObjectId, ref: "User" },
    //   },
    // ],
  },
  { timestamps: true }
);

export default model<ProductInterface>('Product', productSchema);
