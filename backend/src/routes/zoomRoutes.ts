import express, { Request, Response } from "express";
import axios from "axios";
import { IUser } from "../models/User";
import { ZoomToken } from "../models/ZoomToken";

const router = express.Router();

// ✅ Utility: Check required environment variables
function checkEnvVars() {
  const required = ["ZOOM_CLIENT_ID", "ZOOM_CLIENT_SECRET", "ZOOM_REDIRECT_URI"];
  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing env variable: ${key}`);
    }
  });
}

// ✅ Route 1: Redirect user to Zoom's OAuth page
router.get("/authorize", (req: Request, res: Response) => {
  try {
    checkEnvVars();

    const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${process.env.ZOOM_REDIRECT_URI}`;
    res.redirect(zoomAuthUrl);
  } catch (error) {
    console.error("Zoom Auth Error:", error);
    res.status(500).json({ message: "Zoom authorization setup error" });
  }
});

// ✅ Route 2: Zoom callback – exchange code for access token
router.get("/callback", async (req: Request, res: Response) => {
  try {
    checkEnvVars();

    const code = req.query.code as string;
    const user = req.user as IUser;

    if (!code) {
      res.status(400).json({ error: "Missing 'code' in query" });
      return
    }

    if (!user || !user._id) {
      res.status(401).json({ error: "Unauthorized: User not found" });
      return
    }

    const tutorId = user._id;

    const tokenRes = await axios.post("https://zoom.us/oauth/token", null, {
      params: {
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.ZOOM_REDIRECT_URI,
      },
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded", // ✅ required by Zoom
      },
    });

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    await ZoomToken.findOneAndUpdate(
      { tutorId },
      { access_token, refresh_token, expires_in, createdAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Zoom connected successfully!" });

  } catch (error: any) {
    console.error("Zoom Token Exchange Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get Zoom access token" });
  }
});

export default router;
