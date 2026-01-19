import { Router } from "express";
import { 
    createUser, 
    login, 
    getUsers, 
    handleRefreshToken, 
    getProfile,
    changePassword,
    forgotPassword,
    resetPassword
} from "../controllers/user.controller.js"; 
import { authenticateToken } from "../utils/authMiddleware.js";

const userRouter = Router();

userRouter.post("/register", createUser);
userRouter.post("/login", login);
userRouter.get("/all", getUsers);
userRouter.post("/refresh-token", handleRefreshToken);
userRouter.get("/profile", getProfile)
userRouter.put("/change-password", authenticateToken , changePassword)
userRouter.post("/forgot-password", forgotPassword)
userRouter.put("/reset-password/:token" , resetPassword)

export default userRouter;