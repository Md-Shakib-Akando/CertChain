import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICertificate extends Document {
  id: string;
  type: 'Degree Certificate' | 'Academic Transcript' | 'Provisional Certificate' | string;
  program: string;
  session: string;
  batch: string;
  issueDate: string;
  status: 'valid' | 'revoked';
  sha256Hash: string;
  txHash: string;
  blockNumber: number;
  issuerAddress: string;
  network: string;
  degreeName: string;
  studentName: string;
  studentId: string;
  studentEmail?: string;
  cgpa: string;
  version: number;
  revocationDate?: string;
  revocationReason?: string;
  revocationTxHash?: string;
  supersededBy?: string;
  pdfBase64?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Degree Certificate', 'Academic Transcript', 'Provisional Certificate'],
      index: true,
    },
    program: {
      type: String,
      required: true,
    },
    session: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
      required: true,
    },
    issueDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['valid', 'revoked'],
      default: 'valid',
      index: true,
    },
    sha256Hash: {
      type: String,
      required: true,
      index: true,
    },
    txHash: {
      type: String,
      required: true,
    },
    blockNumber: {
      type: Number,
      required: true,
    },
    issuerAddress: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      default: 'Ethereum Sepolia Testnet',
    },
    degreeName: {
      type: String,
      required: true,
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
      index: true,
      trim: true,
    },
    studentEmail: {
      type: String,
      lowercase: true,
      sparse: true,
      index: true,
      trim: true,
    },
    cgpa: {
      type: String,
      default: '3.89',
    },
    version: {
      type: Number,
      default: 1,
    },
    revocationDate: {
      type: String,
    },
    revocationReason: {
      type: String,
    },
    revocationTxHash: {
      type: String,
    },
    supersededBy: {
      type: String,
    },
    pdfBase64: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure mongoose model always synchronizes with latest schema across Next.js reloads
if (mongoose.models && mongoose.models.Certificate) {
  try {
    delete (mongoose.models as Record<string, unknown>).Certificate;
  } catch {}
}

export const Certificate: Model<ICertificate> =
  (mongoose.models.Certificate as Model<ICertificate>) ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema);

