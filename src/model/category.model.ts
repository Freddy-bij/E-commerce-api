 import mongoose, { Document, Schema } from "mongoose"

export interface Icategory extends Document {
    name: string,
    description?: string,
    img:string

}

const categoriesSchema = new Schema<Icategory>({
    name: { type: String, required: true },
    description: { type: String, required: false },
    img: { 
        type: String, 
        required: true 
    },


}, { timestamps: true });

export const category = mongoose.model<Icategory>("Category", categoriesSchema);


