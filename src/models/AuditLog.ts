import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: string;
  actorEmail?: string;
  actorRole: 'admin' | 'controller' | 'issuer' | 'student' | 'system' | string;
  action: string;
  targetType: 'user' | 'certificate' | 'system' | 'blockchain' | 'settings' | string;
  targetId?: string;
  targetReference?: string;
  outcome: 'success' | 'failure' | 'warning';
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  transactionHash?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: String,
      index: true,
    },
    actorEmail: {
      type: String,
      index: true,
      lowercase: true,
      trim: true,
    },
    actorRole: {
      type: String,
      required: true,
      index: true,
      default: 'system',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      required: true,
      index: true,
      default: 'system',
    },
    targetId: {
      type: String,
      index: true,
    },
    targetReference: {
      type: String,
    },
    outcome: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success',
      index: true,
    },
    details: {
      type: String,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
    },
    transactionHash: {
      type: String,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable append-only
  }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
