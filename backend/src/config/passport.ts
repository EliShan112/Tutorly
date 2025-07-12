import passport from "passport";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import User from "../models/User.js";

export default function initializePassport(){
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  throw new Error("Missing Google OAuth environment variables");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) return done(null, existingUser);
        
        const email = profile.emails?.[0]?.value || "";
        
        const newUser = await User.create({
          googleId: profile.id, 
          name: profile.displayName,
          email,
          role: "student",
        });
        
        done(null, newUser);
      } catch (error) {
        done(error);
      }
    }
  )
)

}