import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response, next: NextFunction) =>{
    try {
        const {name, email, password, role} = req.body;

    //find if user already exist before signing up
    const existUser = await User.findOne({email});

    if(existUser){
        return res.status(400).json({message: "User already exists"})
    }

    //hashing the password
    const hashed = await bcrypt.hash(password, 12)

    //creating new user
    const user = await User.create({name, email, password: hashed, role})

    res.status(200).json({message: "Successfully Signed up!"})

    } catch (error) {
        next(error);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) =>{
    try {
        const {email, password} = req.body;

        // Find user by email
        const user = await User.findOne({email})

        // If user not found or password doesn't match, respond with 401 Unauthorized
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({message: "Invalid credentials"})
        }

        // Create a JWT token with user id and role
        const token = jwt.sign(
            {id: user._id, role: user.role},
            process.env.JWT_SECRET!,
            {expiresIn: "1d"}
        )

        // Send the token as an httpOnly cookie (secure in production)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge:  86400000 // 1 day
        })

        res.json({message: "Login successful"})

    } catch (error) {
        next(error)
    }
}

export const logout = (req: Request, res: Response)=>{
    // Clear authentication cookie
    res.cookie("token", "",{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0) // Immediate expiration
    })
    res.status(200).json({message: "Successfully logged out"})
}