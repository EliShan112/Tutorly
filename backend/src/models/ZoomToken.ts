import mongoose from "mongoose";
import { Document, Schema } from "mongoose";

export interface IZoomToken extends Document {
    tutorId: mongoose.Types.ObjectId;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    createdAt: Date;
}

const zoomTokenSchema = new Schema<IZoomToken>({
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    access_token: String,
    refresh_token: String,
    expires_in: Number,
    createdAt:{
        type: Date,
        default: Date.now,
        expires: 3600
    }
})

export const ZoomToken = mongoose.models.zoomToken || mongoose.model("ZoomToken", zoomTokenSchema)