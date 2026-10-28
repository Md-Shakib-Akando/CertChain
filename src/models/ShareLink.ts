import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShareLink extends Document {
  certId: string;
  tokenHash: string; // SHA-256 of the random token
  createdBy: string; // studentId or email
  recipientLabel: string;
  durationHours: number;
  expiresAt: Date;
  revokedAt?: Date | null;
  viewCount: number;
  maxViews?: number | null;
  status: 'active' | 'revoked' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const ShareLinkSchema = new Schema<IShareLink>(
  {
    certId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    recipientLabel: {
      type: String,
      default: 'General Employer',
      trim: true,
    },
    durationHours: {
      type: Number,
      required: true,
      default: 24,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    maxViews: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'revoked', 'expired'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ShareLink: Model<IShareLink> =
  mongoose.models.ShareLink || mongoose.model<IShareLink>('ShareLink', ShareLinkSchema);
