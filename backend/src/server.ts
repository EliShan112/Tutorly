import "./loadenv.js";
import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./config/db.js"


const PORT = process.env.PORT || 3001;

// Debugging log to verify env variables
console.log("SERVER START - ENV VARIABLES:");
console.log("PORT:", PORT);
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "exists" : "missing");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "exists" : "missing");


const startServer = async () => {
  await connectDB(); // 💥 Connect DB before server starts

  app.get('/', (req, res) => {
    res.send("hellooooo");
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();