import bcrypt from 'bcrypt';
import { User } from '../model/user.model.js';
import { generateToken } from '../utils/jwt.js';


export const createUser = async (userData: any) =>{
    const { name, email, password} = userData
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newUser = new User({
        name,
        email,
        password: hashedPassword
    })
    const savedUser = await newUser.save()

    if(!savedUser){
        throw new Error("User not created")
    }else{
        const token = generateToken(savedUser)
        return { token, existingUser: savedUser }
    }
}

