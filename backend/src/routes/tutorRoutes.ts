import express from "express"
import { isAuthenticated, isTutor } from "../middleware/auth"
import { Request, Response } from "express";


const router = express.Router();

// Tutor route: Set availability
router.post("/availability", isAuthenticated, isTutor, async (req: Request, res: Response)=>{
    res.json({message: "Tutor availability set."})
})

export default router;