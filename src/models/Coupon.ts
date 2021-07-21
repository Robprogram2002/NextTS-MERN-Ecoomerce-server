import mongoose from 'mongoose';

export interface CouponInterface {
  name: string;
  expiry: Date;
  discount: number;
  cretaedAt: Date;
}

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      uppercase: true,
      required: 'Nmae is required',
      minlength: [6, 'Too short'],
      maxlength: [12, 'Too long'],
    },
    expiry: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      requred: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<CouponInterface>('Coupon', couponSchema);
