import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'issuer' | 'controller' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'active';
  
  // Student-specific fields
  studentId?: string;
  dept?: string;
  department?: string;
  program?: string;
  batch?: string;
  phone?: string;
  session?: string;
  cgpa?: string;
  enrollmentDate?: string;
  graduationDate?: string;
  academicStatus?: 'Graduated' | 'Active';
  lastLoginAt?: Date;
  
  // Staff/Issuer-specific fields
  employeeId?: string;
  designation?: string;
  walletAddress?: string;
  walletSignature?: string;
  isWalletVerified?: boolean;
  
  // Governance & approval fields
  requestId?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['student', 'issuer', 'controller', 'admin'],
      default: 'student',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active'],
      default: 'pending',
      index: true,
    },
    studentId: {
      type: String,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    employeeId: {
      type: String,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    dept: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    program: {
      type: String,
      trim: true,
    },
    batch: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    session: {
      type: String,
      trim: true,
    },
    cgpa: {
      type: String,
      trim: true,
    },
    enrollmentDate: {
      type: String,
      trim: true,
    },
    graduationDate: {
      type: String,
      trim: true,
    },
    academicStatus: {
      type: String,
      enum: ['Graduated', 'Active'],
      default: 'Active',
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    designation: {
      type: String,
      trim: true,
    },
    walletAddress: {
      type: String,
      lowercase: true,
      sparse: true,
      trim: true,
      index: true,
    },
    walletSignature: {
      type: String,
    },
    isWalletVerified: {
      type: Boolean,
      default: false,
    },
    requestId: {
      type: String,
      sparse: true,
      unique: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite error during Next.js hot reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
