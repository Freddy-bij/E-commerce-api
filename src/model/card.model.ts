import mongoose, { Document, Schema } from "mongoose";

export interface IcardItem extends Document {
    product:mongoose.Types.ObjectId;
    quantity:number;
}

export interface Icart extends Document {
    user: mongoose.Types.ObjectId;
    items: IcardItem[];
}

const cardShema = new Schema<IcardItem>({
    product:{
        type: Schema.Types.ObjectId,
        ref:"Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    }
})

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