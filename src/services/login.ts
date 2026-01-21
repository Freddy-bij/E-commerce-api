import { User } from "../model/user.model.js"
import { verifyToken } from "../utils/auth.middleware.js"
import { generateToken } from "../utils/jwt.js"
import { type JwtPayload } from "jsonwebtoken"
import bcrypt from "bcrypt"

interface MyToken extends JwtPayload {
    _id: string;
}



export const loginService = async (email: string, password: string) => {
  const existingUser = await User.findOne({ email }).select("+password");

  if (!existingUser) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const token = generateToken({
    _id: existingUser._id.toString(),
    email: existingUser.email,
  });

  return { token, existingUser };
};


export const refreshTokenService = async (oldToken: string) => {
  try {
    const decodedToken = verifyToken(oldToken) as MyToken;

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new Error("User not found");
    }

    const newToken = generateToken({
      _id: user._id.toString(),
      email: user.email,
    });

    return { token: newToken };
  } catch (error) {
    throw new Error("Invalid token");
  }
};
