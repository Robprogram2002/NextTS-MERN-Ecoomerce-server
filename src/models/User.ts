import { Schema, model } from 'mongoose';

interface UserInterface {
  usrename: string;
  email: string;
  photoUrl: string;
  role: string;
  cart: any[];
  address: string;
  createdAt: Date;
  updatedAt: Date;
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
    cart: {
      type: Array,
      default: [],
    },
    address: String,
    //   wishlist: [{ type: ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export default model<UserInterface>('User', userSchema);
