import express from "express"
import { isAuthenticated, isStudent } from "../middleware/auth"
import { Request, Response } from "express";

const router = express.Router();

router.post("/book-session", isAuthenticated, isStudent, async(req: Request, res: Response)=>{
    res.json({message: "Student session booked."})
})

export default router;