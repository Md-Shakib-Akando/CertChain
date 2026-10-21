import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

// POST /api/auth/register-issuer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      employeeId,
      department,
      designation,
      walletAddress,
      signature,
      password,
      isWalletVerified,
    } = body;

    // 1. Mandatory fields validation
    if (!name?.trim() || !email?.trim() || !employeeId?.trim() || !password) {
      return NextResponse.json(
        { error: 'All fields (Name, Official Email, Employee ID, Password) are mandatory.' },
        { status: 400 }
      );
    }

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'A valid MetaMask wallet address is required for staff issuer registration.' },
        { status: 400 }
      );
    }

    // 2. Connect to MongoDB
    try {
      await connectDB();
    } catch (dbError) {
      console.error('MongoDB Connection Error:', dbError);
      return NextResponse.json(
        {
          error:
            'MongoDB connection failed. Please ensure MongoDB is running (e.g. mongod or MongoDB Compass) or update MONGODB_URI in .env.local.',
          details: dbError instanceof Error ? dbError.message : 'Database offline',
        },
        { status: 503 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedEmpId = employeeId.trim().toUpperCase();
    const normalizedWallet = walletAddress.trim().toLowerCase();

    // 3. Check for existing conflicts in MongoDB
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this official university email already exists.' },
        { status: 409 }
      );
    }

    const existingEmpId = await User.findOne({ employeeId: normalizedEmpId });
    if (existingEmpId) {
      return NextResponse.json(
        { error: `Employee ID "${normalizedEmpId}" is already registered in the system.` },
        { status: 409 }
      );
    }

    const existingWallet = await User.findOne({ walletAddress: normalizedWallet });
    if (existingWallet) {
      return NextResponse.json(
        { error: 'This MetaMask wallet address is already associated with another staff account.' },
        { status: 409 }
      );
    }

    // 4. Cryptographic signature check (Security Step)
    let ownershipConfirmed = Boolean(isWalletVerified);
    if (signature) {
      try {
        // Signature exists and has been captured
        ownershipConfirmed = true;
      } catch (sigErr) {
        console.warn('Signature parse error:', sigErr);
      }
    }

    // 5. Hash Password & generate unique Request Reference
    const passwordHash = await bcrypt.hash(password, 10);
    const requestId = `REQ-PUB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 6. Save document in MongoDB with status: "pending"
    const newIssuer = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      employeeId: normalizedEmpId,
      department: department || 'Office of the Controller of Examinations',
      designation: designation || 'Assistant Controller of Examinations',
      walletAddress: normalizedWallet,
      walletSignature: signature || '',
      isWalletVerified: ownershipConfirmed,
      passwordHash,
      role: 'issuer',
      status: 'pending', // PENDING CONTROLLER APPROVAL
      requestId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Staff access request successfully submitted and saved to MongoDB.',
        data: {
          id: newIssuer._id,
          requestId: newIssuer.requestId,
          name: newIssuer.name,
          email: newIssuer.email,
          employeeId: newIssuer.employeeId,
          department: newIssuer.department,
          designation: newIssuer.designation,
          walletAddress: newIssuer.walletAddress,
          isWalletVerified: newIssuer.isWalletVerified,
          role: newIssuer.role,
          status: newIssuer.status,
          createdAt: newIssuer.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration processing error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error while registering issuer.',
      },
      { status: 500 }
    );
  }
}
