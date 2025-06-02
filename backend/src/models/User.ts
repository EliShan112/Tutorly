import mongoose from "mongoose";
import { Document } from "mongoose";

export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    googleId?: string;
    role: 'tutor' | 'student';
}

const userSchema = new mongoose.Schema<IUser>({
    name : {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    googleId: String,

    role:{
        type: String,
        enum: ['student', 'tutor'],
        default: 'student'
    }

}, {timestamps: true})

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;