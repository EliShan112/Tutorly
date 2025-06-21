import express from "express";
import mongoose from "mongoose";
import { isAuthenticated, isStudent } from "../middleware/auth.js";
import { Request, Response } from "express";
import Availability from "../models/Availability.js";
import Booking from "../models/Booking.js";
import { IUser } from "../models/User.js";
import axios from "axios";
import { ZoomToken } from "../models/ZoomToken.js";
import { refreshZoomToken, createZoomMeeting } from "../utils/zoom.js";



const router = express.Router();

router.post("/book-session", isAuthenticated, isStudent, async (req: Request, res: Response) => {

    const session = await mongoose.startSession()
    session.startTransaction();

    let zoomMeetingId: string | null = null;
    let zoomLink: string | null = null;

  try {
    const { tutorId, date, slot } = req.body;
    const user = req.user as IUser;

    if (!tutorId || !date || !slot) {
      res.status(400).json({ message: "Missing required fields." });
      return
    }

    //  Validate date format (YYYY-MM-DD)
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));

    //  Validate slot format (HH:mm)
    const isValidSlot = /^([01]\d|2[0-3]):([0-5]\d)$/.test(slot);

    if (!isValidDate || !isValidSlot) {
    res.status(400).json({ message: "Invalid date or slot format." });
    return
    }

    //Atomically pull the slot
    const availabilityUpdate = await Availability.findOneAndUpdate(
        {tutorId, date, slots: slot},
        {$pull: {slots: slot}},
        {new: true, session}
    );

    if(!availabilityUpdate){
        await session.abortTransaction();
        res.status(409).json({message: "Slot no longer available"})
        return;
    }

//Get Zoom token
    // fetching the tutor’s OAuth token from your database.
    const zoomToken = await ZoomToken.findOne({tutorId}).session(session);
    if (!zoomToken || !zoomToken.access_token) {
      await session.abortTransaction();
      res.status(400).json({ message: "Tutor not connected to Zoom." });
      return
    }



    // Create Zoom Meeting
    let accessToken = zoomToken.access_token;
    try {
        const zoomResponse = await createZoomMeeting(accessToken, user, date, slot);
        zoomLink = zoomResponse.data.join_url;
        zoomMeetingId = zoomResponse.data.id;
    } catch (zoomError: any) {
        if(zoomError.response?.status === 401){
            //time to refresh the token
            accessToken = await refreshZoomToken(tutorId);
            
            const retryResponse = await createZoomMeeting(accessToken, user, date, slot);
            zoomLink = retryResponse.data.join_url;
            zoomMeetingId = retryResponse.data.id;
        } else{
            throw zoomError;
        }
    }

    //save booking
    await Booking.create(
        [{
            tutorId,
            studentId: user._id,
            slot,
            date,
            zoomLink,
            zoomMeetingId,
        }],
        {session}
    )

    await session.commitTransaction();
    res.status(200).json({message: "Session booked!", zoomLink})

  } catch (err: any) {
    await session.abortTransaction();

    // Attempt rollback: add slot back
    if(req.body?.tutorId && req.body?.date && req.body?.slot){
        await Availability.updateOne(
            {tutorId: req.body.tutorId, date: req.body.date},
            {$addToSet: { slots: req.body.slot}}
        )
    }

    // Attempt to delete orphaned Zoom meeting
    if(zoomMeetingId){
        try {
            const zoomToken = await ZoomToken.findOne({tutorId: req.body.tutorId});
            if(zoomToken?.access_token){
                await axios.delete(
                    `https://api.zoom.us/v2/meetings/${zoomMeetingId}`,
                    {
                        headers:{
                            Authorization: `Bearer ${zoomToken.access_token}`,
                        },
                    }
                );
            }
        } catch (cleanupErr) {
            console.error("Zoom meeting cleanup failed:", cleanupErr)
        }
    }

    console.error("Booking error:", err.stack || err)
    res.status(500).json({error: "Session booking failed."})
  } finally{
    session.endSession();
  }


  
});

export default router;
