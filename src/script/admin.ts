import { User } from "../model/user.model.js"
import bcrypt from "bcrypt"

export const createAdminAccount = async () => {
    try {
       const existingAdmin = await User.findOne({
        email: "admin@ecommerce.com"
       }) 
       
       if(!existingAdmin){
        const hashedPassword = await bcrypt.hash("admin123", 10);
        
        const newAdmin = new User({
            name: "Admin",  // Changed from firstName to name (matches your User model)
            email: "admin@ecommerce.com",
            password: hashedPassword,
            role: "admin"
        })
        
        await newAdmin.save();
        console.log("✅ Admin account created successfully");
        console.log("   Email: admin@ecommerce.com");
        console.log("   Password: admin123");
       } else {
        console.log("✅ Admin account already exists");
       }
    } catch (error) {
      console.error("❌ Error creating admin account:", error)  
    }
}