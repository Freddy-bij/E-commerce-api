import mongoose, { Document, Schema , Types } from "mongoose";

export interface IcartItem {
    product: Types.ObjectId | string;
    quantity: number;
    _id?: Types.ObjectId;
}

// 2. Mongoose Document Interface
export interface Icart extends Document {
    user: Types.ObjectId | string;
    items: Types.DocumentArray<IcartItem & mongoose.Types.Subdocument>; 
}

const cardShema = new Schema<IcartItem>({
    product:{
        type: Schema.Types.ObjectId ,
        ref:"Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    }
},{_id:false})

// Main cart Schema

const cartShema = new Schema<Icart>({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    items:[cardShema]
    
},{ timestamps: true})

const cart = mongoose.model("cart" , cartShema)

export default cart