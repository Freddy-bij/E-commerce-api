
import mongoose, { Document, Schema } from "mongoose";
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    resetPasswordToken?: string;
    resetPasswordExpire: Date;
    
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true , unique: true },
    password: { type: String, required: true , select: false},
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    role: { type:String, enum:["admin", "vendor" ,  "customer"] , default: "customer"}

}, { timestamps: true });

export const User = mongoose.model<IUser>("user", UserSchema);