import bcrypt from 'bcrypt';
import { User } from '../model/user.model.js';
import { generateToken } from '../utils/jwt.js';
import { sendWelcomeEmail } from './email.services.js';

export const createUser = async (userData: any) => {
    const { name, email, password } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User with this email already exists");
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({
        name,
        email,
        password: hashedPassword
    });
    
    const savedUser = await newUser.save();

    if (!savedUser) {
        throw new Error("User not created");
    }
    
    // Generate token
 const token = generateToken({
        _id: savedUser._id.toString(), // Convert ObjectId to string
        email: savedUser.email
    });
    
    // Send welcome email (async, don't block registration)
    sendWelcomeEmail(email, name).catch(err => {
        console.error('Failed to send welcome email:', err);
        // Don't fail registration if email fails
    });
    
    return { token, existingUser: savedUser };
};