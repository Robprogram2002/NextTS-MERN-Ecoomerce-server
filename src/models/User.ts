import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

export interface UserInterface {
  usrename: string;
  email: string;
  photoUrl: string;
  role: string;
  cart: {
    products: {
      product: any;
      count: number;
      color: string;
    }[];
    totalAmount: number;
    appliedCoupon: Boolean;
  };
  address: string;
  createdAt: Date;
  updatedAt: Date;
  _id: string;
}

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    photoUrl: {
      type: String,
      default:
        'https://thumbs.dreamstime.com/z/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg',
    },
    role: {
      type: String,
      default: 'subscriber',
    },
    address: String,
    cart: {
      products: [
        {
          product: {
            type: ObjectId,
            ref: 'Product',
          },
          count: Number,
          color: String,
        },
      ],
      totalAmount: Schema.Types.Number,
      appliedCoupon: Schema.Types.Boolean,
    },
    //   wishlist: [{ type: ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export default model<UserInterface>('User', userSchema);
