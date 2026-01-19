import { type  Request, type Response } from "express"; 
import { loginService, refreshTokenService as refreshTokenService } from "../services/login.js"; 
import { createUser as createUserService } from "../services/Register.js"; 
import { getUsersService } from "../services/user.service.js";
import { User } from "../model/user.model.js";
import type { AuthRequest } from "../utils/authMiddleware.js";
import bcrypt from "bcrypt"

// CREATE USER(register)

export const createUser = async (req: Request, res: Response) => { 
    try {
        const userData = req.body;
       
        const { token, existingUser } = await createUserService(userData); 
        
        res.status(201).json({ token, existingUser, message: "User created successfully" });
    } catch (error: any) { 
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
    //   LOGIN Logic
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const { token, existingUser } = await loginService(email, password);
        res.status(200).json({ token, existingUser, message: "Login successful" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// LOGIC FOR GETTING ALL USERS

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await getUsersService();
        res.status(200).json({ users });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// HANDLE TO REFRESH TOKEN

export const handleRefreshToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const newTokenData = await refreshTokenService(token);
        res.status(200).json(newTokenData);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

    //  GET USER PROFILE 

export const getProfile = async ( req:AuthRequest , res: Response) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        data: user,
    });
}

//  CHNGE PASSWORD USER logic

export const  changePassword = async ( req: AuthRequest , res: Response) =>{
     const { oldPassword , newPassword } = req.body;

     const user = await User.findById(req.user._id).select("+passworc");

     if(!user) {
        return res.status(404).json({ message: "Useer not found"})
     }

     const isMatch = await bcrypt.compare(oldPassword, user.password);

     if (!isMatch){
        return res.status(400).json({ message: "old password incorrect"});
     }
     const salt = await bcrypt.genSalt(10);
     user.password = await bcrypt.hash(newPassword , salt)

     await user.save();

     res.status(200).json({
        success:true,
        message: "Password changed successfully"
     });
}

// FORGOT PASSWORD logic 

export const forgotPassword = async ( req: any , res: Response) => {
    const { email} = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found"});
    }

    const resetToken = crypto.randomBytes(20).toString("hex")

    user.resetPasswordToken = crypto

    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000)

    await user.save()

    // send email here

    res.status(200).json({
        success: true,
        resetToken,
        message: "Reset token generated"
    })
}

export const resetPassword = async (req: any, res: Response) => {
    const resetToken = crypto

    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpire: { $gt: new Date() },
    })

    if (!user) {
        return res.status(400).json({ message: "Invalid or expired token"});

    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined!;
    user.resetPasswordExpire = undefined!;

    res.status(200).json({
        success: true,
        message: "Password reset successful"
    })

}
