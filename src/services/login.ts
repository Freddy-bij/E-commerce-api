import { User } from "../model/user.model.js"
import { verifyToken } from "../utils/authMiddleware.js"
import { generateToken } from "../utils/jwt.js"
import { type JwtPayload } from "jsonwebtoken"
import bcrypt from "bcrypt"

interface MyToken extends JwtPayload {
    _id: string;
}

export const loginService = async( email:string , password:string) => {
  try {
    const existingUser = await User.findOne({ email})
    if(!existingUser){
        throw new Error("User not found")
    }
    const isPasswordValid = await bcrypt.compare(password, existingUser.password)
    if(!isPasswordValid){
        throw new Error("Invalid password")
    }else{
      const token = generateToken(existingUser)
    return { token, existingUser } 
    }
   

  } catch (error) {
    throw new Error ("invalid credentials")
  }
}

export const refreshTokenService = (oldToken:string)=>{
    try {
        const decodedToken = verifyToken(oldToken) as MyToken
        const user = User.findById(decodedToken._id)
        if(!user) throw new Error("User not found")
        const newToken = generateToken(user)
        return { token: newToken, user }
    } catch (error) {
        throw new Error("Invalid token")
    }
}

