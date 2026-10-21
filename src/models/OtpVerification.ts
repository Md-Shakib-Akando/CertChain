import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtpVerification extends Document {
  email: string;
  studentId: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Document expires automatically at expiresAt
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'otp-verifications',
  }
);

export const OtpVerification: Model<IOtpVerification> =
  mongoose.models.OtpVerification ||
  mongoose.model<IOtpVerification>('OtpVerification', OtpVerificationSchema, 'otp-verifications');
