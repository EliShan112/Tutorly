import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import User, {IUser} from "../models/User";

interface DecodedToken {
  id: string;
  role: "student" | "tutor";
}


export const isAuthenticated  = async (req: Request, res: Response, next: NextFunction)=>{
    const token = req.cookies.token;

    if(!token){
        res.status(401).json({message: "Not authenticated"})
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken
        
        const user = await User.findById(decoded.id)
        if(!user){
            res.status(401).json({message: "User not found"})
            return
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
        return
    }
}

export const isTutor = (req: Request, res: Response, next: NextFunction)=>{
    const user = req.user as IUser | undefined;
    if(user?.role !== "tutor"){
        res.status(403).json({message: "Access denied. Tutor only."})
        return
    }
    next();
}

export const isStudent = (req: Request, res:Response, next:NextFunction) =>{
    const user = req.user as IUser | undefined;
    if(user?.role !== "student"){
        res.status(403).json({message: "Access denied. Student only."})
        return
    }
    next();
}