import axios from "axios";
import { IUser } from "../models/User";
import { ZoomToken } from "../models/ZoomToken"
import moment from "moment-timezone";

export const refreshZoomToken = async (tutorId: string)=>{
    const token = await ZoomToken.findOne({tutorId});
    if(!token){
        throw new Error("No Zoom Token")
    }
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", token.refresh_token);
    params.append("client_id", process.env.ZOOM_CLIENT_ID!);
    params.append("client_secret", process.env.ZOOM_CLIENT_SECRET!);

    const response = await axios.post("https://zoom.us/oauth/token", params, {
        headers:{
            "Content-Type": "application/x-www-form-urlencoded",
        }
    });
    token.access_token = response.data.access_token;
    token.refresh_token = response.data.refresh_token;
    await token.save();
    return response.data.access_token;
}

//Helper function
export const createZoomMeeting = async (
        accessToken: string,
        user: IUser,
        date: string,
        slot: string
    ) => {
        const isoDateTime = moment.tz(`${date} ${slot}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").toISOString();

        return await axios.post(
        "https://api.zoom.us/v2/users/me/meetings",
        {
            topic: `Tutoring Session with ${user.name}`,
            type: 2,
            start_time: isoDateTime,
            duration: 30,
            settings: {
                join_before_host: true,
                host_video: true,
                participant_video: true,
            },
        },
        {
            headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            },
        }
        );
    }