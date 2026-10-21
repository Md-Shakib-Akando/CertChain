import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudentRecord extends Document {
  name: string;
  studentId: string;
  dept?: string;
  department?: string;
  batch: string;
  phone?: string;
  email: string;
  program?: string;
  session?: string;
  cgpa?: string;
  enrollmentDate?: string;
  graduationDate?: string;
  status?: string;
  isRegistered?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const StudentRecordSchema = new Schema<IStudentRecord>(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    dept: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    batch: {
      type: String,
      required: [true, 'Batch is required'],
      trim: true,
    },
    phone: {
      type: String,
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
    program: {
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
    status: {
      type: String,
      default: 'Active',
      trim: true,
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: false,
    collection: 'student-record', // Targeting the user's real MongoDB collection
  }
);

// If model was previously compiled under old collection name, delete and recompile
if (mongoose.models.StudentRecord) {
  delete mongoose.models.StudentRecord;
}

export const StudentRecord: Model<IStudentRecord> =
  mongoose.model<IStudentRecord>('StudentRecord', StudentRecordSchema, 'student-record');
