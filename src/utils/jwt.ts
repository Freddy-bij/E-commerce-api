import jwt from "jsonwebtoken";

interface JwtPayload {
    id: string;
    email: string
}

export const generateToken =( user: { _id: string, email: string}) => {
    const payload : JwtPayload = {
        id: user._id.toString(),
        email: user.email
    }
    const secretKey =  jwt.sign(payload, process.env.JWT_SECRET_KEY! , { expiresIn: "1h"})
    return secretKey
}