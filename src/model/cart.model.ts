import mongoose, { Document, Schema } from "mongoose";

interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true, // One cart per user
    },
    items: [CartItemSchema],
  },
  { 
    timestamps: true 
  }
);

// ✅ Changed from default export to named export
const Cart = mongoose.model<ICart>("cart", CartSchema);

export default Cart