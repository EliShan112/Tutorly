import express from "express"
import { isAuthenticated, isTutor } from "../middleware/auth"
import { Request, Response } from "express";
import Availability from "../models/Availability";
import { IUser } from "../models/User";


const router = express.Router();

// Tutor route: Set availability
router.post("/availability", isAuthenticated, isTutor, async (req: Request, res: Response)=>{
    const {date, slots} = req.body;

    if(!date || !slots || !Array.isArray(slots)){
        res.status(400).json({message: "Date and slots required."})
        return
    }

    const user = req.user as IUser;

    const existing = await Availability.findOne({ tutorId: user._id, date });
    if(existing){
        existing.slots = slots;
        await existing.save();
    }
    else{
        await Availability.create({tutorId: user._id, date, slots})
    }
    res.json({message: "Availability saved." })
})

export default router;  