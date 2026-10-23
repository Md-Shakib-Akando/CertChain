import mongoose, { Schema, Document, Model } from 'mongoose';

export type RevocationWorkflowStatus =
  | 'pending_review'
  | 'awaiting_signature'
  | 'submitted'
  | 'confirmed'
  | 'rejected'
  | 'failed';

export interface IRevocationRequest extends Document {
  certificateId: string;
  certificateType: 'Degree Certificate' | 'Academic Transcript' | 'Provisional Certificate' | string;
  studentName: string;
  studentId: string;
  program: string;
  issueDate: string;
  originalTxHash?: string;
  sha256Hash?: string;
  
  // Requester (Registrar / Issuer)
  requestingIssuerId?: string;
  requestingIssuerName: string;
  requestingIssuerEmail: string;
  requestingIssuerDepartment?: string;
  requestingIssuerWallet?: string;
  requestingIssuerStatus?: 'authorized' | 'pending' | 'suspended';
  
  // Reason & Evidence
  reason: string;
  evidenceNotes?: string;
  requestedAt: Date;
  
  // Workflow States per PDF Section 6.4
  currentCertificateStatus: 'valid' | 'pending_revocation' | 'revoked';
  workflowStatus: RevocationWorkflowStatus;
  
  // Co-signature & On-chain details
  controllerSignerEmail?: string;
  controllerSignerWallet?: string;
  controllerSignedAt?: Date;
  controllerSignatureHash?: string;
  transactionHash?: string;
  blockNumber?: number;
  network?: string;
  
  // Rejection Details
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: Date;
  
  // Failure / Retry tracking
  failureReason?: string;
  retryCount?: number;
  
  isDemo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RevocationRequestSchema = new Schema<IRevocationRequest>(
  {
    certificateId: {
      type: String,
      required: [true, 'Certificate ID is required'],
      index: true,
      trim: true,
    },
    certificateType: {
      type: String,
      required: true,
      default: 'Degree Certificate',
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    program: {
      type: String,
      required: true,
    },
    issueDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    originalTxHash: {
      type: String,
      trim: true,
    },
    sha256Hash: {
      type: String,
      trim: true,
    },
    requestingIssuerId: {
      type: String,
      index: true,
    },
    requestingIssuerName: {
      type: String,
      required: true,
      trim: true,
    },
    requestingIssuerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    requestingIssuerDepartment: {
      type: String,
      default: 'Office of the Registrar',
    },
    requestingIssuerWallet: {
      type: String,
      lowercase: true,
      trim: true,
    },
    requestingIssuerStatus: {
      type: String,
      enum: ['authorized', 'pending', 'suspended'],
      default: 'authorized',
    },
    reason: {
      type: String,
      required: [true, 'Revocation reason is required'],
      trim: true,
    },
    evidenceNotes: {
      type: String,
      trim: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    currentCertificateStatus: {
      type: String,
      enum: ['valid', 'pending_revocation', 'revoked'],
      default: 'pending_revocation',
      index: true,
    },
    workflowStatus: {
      type: String,
      enum: [
        'pending_review',
        'awaiting_signature',
        'submitted',
        'confirmed',
        'rejected',
        'failed',
      ],
      default: 'pending_review',
      index: true,
    },
    controllerSignerEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    controllerSignerWallet: {
      type: String,
      lowercase: true,
      trim: true,
    },
    controllerSignedAt: {
      type: Date,
    },
    controllerSignatureHash: {
      type: String,
      trim: true,
    },
    transactionHash: {
      type: String,
      sparse: true,
      trim: true,
    },
    blockNumber: {
      type: Number,
    },
    network: {
      type: String,
      default: 'Ethereum Sepolia Testnet',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    rejectedBy: {
      type: String,
      trim: true,
    },
    rejectedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models && mongoose.models.RevocationRequest) {
  try {
    delete (mongoose.models as Record<string, unknown>).RevocationRequest;
  } catch {}
}

export const RevocationRequest: Model<IRevocationRequest> =
  (mongoose.models.RevocationRequest as Model<IRevocationRequest>) ||
  mongoose.model<IRevocationRequest>('RevocationRequest', RevocationRequestSchema);
