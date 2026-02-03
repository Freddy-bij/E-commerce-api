import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
    name: String
    price: Number
    description?: String,
    categoryId: mongoose.Types.ObjectId
    inStock: Boolean,
    quantity: Number,
    img:string
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: false },
    categoryId: { type: mongoose.Types.ObjectId, ref: "Category"},
    inStock: { type: Boolean },
    quantity: { type: Number  },
    img:{ type: String}

}, { timestamps: true });

 const Product = mongoose.model("Product", ProductSchema);
 export default Product;
 