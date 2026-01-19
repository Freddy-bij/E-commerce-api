import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { User } from "../model/user.model.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

interface JwtUserPayload extends JwtPayload {
  id: string;
  email: string;
}

const isJwtUserPayload = (payload: unknown): payload is JwtUserPayload => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "id" in payload &&
    "email" in payload
  );
};

const JWT_SECRET = process.env.JWT_SECRET_KEY;

if(!JWT_SECRET) {
  throw new Error("JWT_SECRET_KEY is not defined")
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }
     const parts = authHeader.split( " ");

     if (parts.length !== 2) {
       return res.status(401).json({ message: "Invalid authorization header format" });
     }

    const token = parts[1];

    
if (!token) {
  return res.status(401).json({ message: "Token missing" });
}

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isJwtUserPayload(decoded)) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(decoded.id).select("_id email role");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};



export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET_KE!);
};
