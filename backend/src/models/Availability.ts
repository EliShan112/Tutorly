import mongoose, { Schema, Document } from "mongoose";

export interface IAvailability extends Document{
    tutorId: mongoose.Types.ObjectId;
    date: string;
    slots: string[];
}


const AvailabilitySchema  = new Schema<IAvailability>({
    tutorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    date: {
        type: String,
        required: true
    },

    slots: [{
        type: String,
        required: true
    }]
    
})

export default mongoose.model<IAvailability>("Availability", AvailabilitySchema);