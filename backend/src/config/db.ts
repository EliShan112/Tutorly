import mongoose from "mongoose";

const connectDB = async () =>{
    try {
        const mongoDBURI = process.env.MONGO_URI;
        if (!mongoDBURI) {
            console.error("❌ MongoDB URI is missing in .env file");
            process.exit(1); 
        }
        await mongoose.connect(mongoDBURI)
    } catch (error) {
        
    }
}

export default connectDB