import { Schema, model } from 'mongoose';

interface SubCategoryInterface {
  _id: string;
  name: string;
  slug: string;
  parent: string;
  createdAt: Date;
  updatedAt: Date;
}

const subSchema = new Schema(
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
    parent: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  },
  { timestamps: true }
);

export default model<SubCategoryInterface>('Sub', subSchema);
