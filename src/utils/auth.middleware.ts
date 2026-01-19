import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { User } from "../model/user.model.js";
import { JWT_SECRET_VALIDATED } from "../config/env.js";

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

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Using the validated secret here removes the TypeScript error
    const decoded = jwt.verify(token, JWT_SECRET_VALIDATED);

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
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET_VALIDATED);
};