import mongoose from 'mongoose';
import { ProductInterface } from './Product';

const { ObjectId } = mongoose.Schema.Types;

interface OrderInterface {
  products: [
    {
      product: ProductInterface[];
      count: number;
      color: string;
    }
  ];
  paymentIntent: any;
  orderStatus: string;
  orderBy: string;
}

const orderSchema = new mongoose.Schema(
  {
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
    paymentIntent: {},
    orderStatus: {
      type: String,
      default: 'Not Processed',
      enum: [
        'Not Processed',
        'processing',
        'Dispatched',
        'Cancelled',
        'Completed',
      ],
    },
    orderedBy: { type: ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<OrderInterface>('Order', orderSchema);
