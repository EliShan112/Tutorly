import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document{
    tutorId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    date: string;
    slot: string;
    zoomLink: string;
}

const BookingSchema = new Schema<IBooking>({
    tutorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    studentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    date: {
        type: String,
        required: true
    },

    slot:{
        type: String,
        required: true
    },

    zoomLink: {
        type: String,
        required: true,
        validate: {
        validator: (v: string) => /^https?:\/\/.+$/.test(v),
        message: 'Invalid Zoom link'
    }

    }
},{timestamps: true})

//prevent double booking
BookingSchema.index({tutorId: 1, date: 1, slot:1,}, {unique: true});

export default mongoose.model<IBooking>("Booking", BookingSchema);