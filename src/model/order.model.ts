import { model, Schema, type Types, Document } from "mongoose";

export interface OrderItem {
  product: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface BillingDetails {
  firstName: string;
  lastName: string;
  companyName?: string;
  country: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  orderNotes?: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  billingDetails?: BillingDetails;
  shippingDetails?: BillingDetails;
  createdAt: Date;
  updatedAt: Date;
}

// Billing/Shipping Details Schema
const AddressSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: true
  },
  streetAddress: {
    type: String,
    required: false
  },
  apartment: {
    type: String
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  orderNotes: {
    type: String
  }
}, { _id: false });

// Order Item Schema
const OrderItemSchema = new Schema<OrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// Main Order Schema
const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (items: OrderItem[]) {
          return items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    billingDetails: {
      type: AddressSchema,
      required: false
    },
    shippingDetails: {
      type: AddressSchema,
      required: false
    }
  },
  { timestamps: true }
);

const Order = model<IOrder>("Order", orderSchema);
export default Order;