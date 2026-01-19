import { User } from "../model/user.model.js"
import bcrypt from "bcrypt"

export const createAdminAcount = async () => {
    try {
       const exitingAdmin = await User.findOne({
        email: "admin@ecommerce.com"
       }) 
       if(!exitingAdmin){
        const newAdmin = new User({
            firstName: "Admin",
            email:"admin@ecommerce.com",
            password: await bcrypt.hash("admin",10),
            role: "admin"

        })
        await newAdmin.save();
        console.log("Admin aldready exist")
       }
    } catch (error) {
      console.log("Error creating  admin account" )  
    }
}