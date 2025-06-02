import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import session from "express-session";
import passport from "passport";
import "./config/passport.js";
import User from "./models/User.js";
import tutorRoutes from "./routes/tutorRoutes.js"
import studentRoutes from "./routes/tutorRoutes.js"


// Validate environment variables
const { CLIENT_URL, SESSION_SECRET } = process.env;
if (!CLIENT_URL || !SESSION_SECRET) {
  throw new Error("Missing required environment variables");
}

const app = express();

app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));

app.use(session({
    secret: SESSION_SECRET!,
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user: any, done) =>done(null, user.id))
passport.deserializeUser(async (id, done)=>{
    const user = await User.findById(id)
    done(null, user)
})

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoutes);
app.use("/api/tutor", tutorRoutes)
app.use("/api/student", studentRoutes)

app.use(errorMiddleware)


export default app;