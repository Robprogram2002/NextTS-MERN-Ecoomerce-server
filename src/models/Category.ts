import mongoose from 'mongoose';

interface CategoryTypes {
  name: string;
  slug: string;
  createdAt: Date;
  _id: string;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: 'Name is required',
      minlength: [2, 'Too short'],
      maxlength: [32, 'Too long'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<CategoryTypes>('Category', categorySchema);
