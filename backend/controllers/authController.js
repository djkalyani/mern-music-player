import User from "../models/userModel.js";
import imagekit from "../config/imagekit.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import sendMail from "../utils/sendEmail.js";

dotenv.config();

const createToken = (userId) => {
    return jwt.sign({id:userId},process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN || "7d",});
};


const signup = async (req, res) => {
    try {
        const { name, email, password, avatar } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "EmailID exists already" });
        }

        let avatarUrl = "";
        // Note: Ensure imagekit is imported/initialized at the top of this file!
        if (avatar) {
            const uploadResponse = await imagekit.upload({
                file: avatar,
                fileName: `avatar_${Date.now()}.jpg`, 
                folder: "/mern-music-player",
            });
            avatarUrl = uploadResponse.url;
        }

        const user = await User.create({
            name,
            email,
            password,
            avatar: avatarUrl,
        });

        const token = createToken(user._id);
        // Fixed: changed comma to dot, and fixed variable names
        return res.status(201).json({
            message: "User Created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            },
            token,
        });

    } catch (error) {
        console.error("Signup Error:", error.message);
        res.status(500).json({ message: "Signup Error", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fixed: removed the !! from email
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email ID doesn't exist" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = createToken(user._id);
        // Fixed: fixed variable names to use user object
        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Login Error" });
    }
};

const getMe = async (req,res) => {
    if(!req.user) return res.status(401).json({message:"Not Authenticated"});
    res.status(200).json(req.user);
};

const forgotPassword = async(req,res) =>{
    try{
        const {email} = req.body;
        if(!email) return res.status(400).json({message:"Email is required"});

        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message:"No user found"});

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordTokenExpires = Date.now()+10*60*1000; //10 mins

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        //Send an email
        await sendMail({
            to: user.email,
            subject: "Reset your password",
            html: `
            <h3>Password Reset>/h3>
            <p>Click on the link below to reset your password<p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link expires in 10 minutes<p>
            `,
        });

        res.status(200).json({message: "Password reset email sent"});
    } catch (error){
        res.status(500).json({message: "Something Went wrong"});
    }
};
    
const resetPassword = async (req,res) => {
    try{
        const {token} = req.params;
        const {password} = req.body;

        if(!password || password.length<0){
            return res.status(400).json({message:"Password must be of length 6 or more"});
        }

        const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordTokenExpires: {$gt: Date.now()},
        });

        if(!user) return res.status(400).json({message:"Token is invalid or expired"});

        user.password = password;
        user.resetPassword = undefined;
        user.resetPasswordTokenExpires = undefined;

        await user.save();

        res.status(200).json({message:"Password updated successfully"});
    } catch(error){
        console.error("Reset password error:",error.message);
        res.status(500).json({message:"Something went wrong"});
    }
    
};

const editProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const { name, email, avatar, currentPassword, newPassword } = req.body;
       
        const user = await  User.findById(userId);

        if(name) user.name = name;
        if(email) user.email = email;

        if (currentPassword || newPassword) {
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    message: "Both current and new password are required",
                });
            }

            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res
                    .status(400)
                    .json({ message: "Current password is incorrect" });
            }

            if (newPassword.length < 6) {
                return res
                    .status(400)
                    .json({ message: "Password must be atleast 6 characters" });
            }

            user.password = newPassword;
        }

        if (avatar) {
        const uploadResponse = await imagekit.upload({
            file: avatar,
            fileName: `avatar_${userId}_${Date.now()}.jpg`,
            folder: "/mern-music-palyer",
        });

        user.avatar = uploadResponse.url;
    }

    await user.save();

    return res.status(200).json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        },
        message: "Profile updated successfully"
    });
    } catch (error) {
        console.error("Edit Profile Error",error.message);
        res.status(500).json({message: "Error in updating profile"});
    }
};


export { signup, login, getMe, forgotPassword, resetPassword, editProfile };