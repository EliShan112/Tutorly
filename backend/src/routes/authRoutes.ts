import { Router, RequestHandler  } from "express";
import { signup, login, logout, getCurrentUser } from "../controllers/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();

// Regular authentication routes
router.post("/signup", signup as RequestHandler);
router.post("/login", login as RequestHandler);
router.get("/logout", logout as RequestHandler)
router.get("/me", getCurrentUser as RequestHandler);

// Google OAuth routes
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

router.get("/google/callback", 
    passport.authenticate("google", {
        failureRedirect: "/login",
        session: true
    }),
    async (req, res) => {
        const user = req.user as any;
        
        // Create JWT token for OAuth user
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET!, 
            { expiresIn: "1d" }
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 86400000
        });

        // Redirect to client dashboard
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
);

export default router;

