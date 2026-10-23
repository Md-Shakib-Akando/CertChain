import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Certificate } from '@/models/Certificate';
import { AuditLog } from '@/models/AuditLog';

// GET /api/controller/issuers
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q')?.trim() || '';
    const statusFilter = searchParams.get('status')?.trim() || '';
    const authFilter = searchParams.get('auth')?.trim() || '';

    const filterObj: Record<string, unknown> = { role: 'issuer' };

    if (statusFilter && statusFilter !== 'all') {
      filterObj.status = statusFilter;
    }

    if (query) {
      filterObj.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } },
        { walletAddress: { $regex: query, $options: 'i' } },
      ];
    }

    const issuers = await User.find(filterObj)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    // Count issued certificates per issuer address if available
    const certificates = await Certificate.find({}).select('issuerAddress').lean();
    const certCountByWallet: Record<string, number> = {};
    certificates.forEach((c) => {
      if (c.issuerAddress) {
        const addr = c.issuerAddress.toLowerCase();
        certCountByWallet[addr] = (certCountByWallet[addr] || 0) + 1;
      }
    });

    const formatted = issuers.map((u) => {
      const walletLower = (u.walletAddress || '').toLowerCase();
      const certCount = certCountByWallet[walletLower] || 0;

      let contractAuth = 'unknown';
      if (u.status === 'active' || u.status === 'approved') {
        contractAuth = u.walletAddress ? 'authorized' : 'pending';
      } else if (u.status === 'pending') {
        contractAuth = 'pending';
      } else if (u.status === 'rejected' || u.status === 'suspended') {
        contractAuth = 'unauthorized';
      }

      return {
        id: String(u._id),
        name: u.name,
        email: u.email,
        department: u.department || 'Office of the Registrar',
        designation: u.designation || 'Registrar / Academic Officer',
        employeeId: u.employeeId || 'EMP-REG',
        walletAddress: u.walletAddress || '',
        contractAuthorization: contractAuth as 'authorized' | 'unauthorized' | 'pending' | 'unknown',
        applicationStatus: (u.status === 'approved' || u.status === 'active'
          ? 'approved'
          : u.status === 'rejected'
          ? 'rejected'
          : 'pending') as 'approved' | 'rejected' | 'pending',
        accountStatus: (u.status === 'suspended' ? 'suspended' : 'active') as 'active' | 'suspended',
        issuedCertificatesCount: certCount,
        createdAt: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Registered',
        isWalletVerified: Boolean(u.isWalletVerified),
        requestId: u.requestId,
      };
    });

    // If authFilter specified, filter by contract authorization
    const results = authFilter && authFilter !== 'all'
      ? formatted.filter((item) => item.contractAuthorization === authFilter)
      : formatted;

    return NextResponse.json({
      success: true,
      issuers: results,
    });
  } catch (error) {
    console.error('Failed to query issuers directory:', error);
    return NextResponse.json(
      {
        error: 'Failed to query issuers directory.',
        details: error instanceof Error ? error.message : 'Database error',
      },
      { status: 500 }
    );
  }
}

// POST /api/controller/issuers - Suspend or Reactivate issuer account
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { issuerId, action, reason, controllerEmail = 'controller@pub.edu.bd' } = body;

    if (!issuerId || !action) {
      return NextResponse.json({ error: 'Issuer ID and action are required.' }, { status: 400 });
    }

    const issuer = await User.findById(issuerId);
    if (!issuer) {
      return NextResponse.json({ error: 'Issuer account not found.' }, { status: 404 });
    }

    const newStatus = action === 'suspend' ? 'suspended' : 'active';
    issuer.status = newStatus;
    await issuer.save();

    // Log in immutable audit trail
    // Explicit policy notice: Suspending an issuer does NOT revoke already issued certificates!
    await AuditLog.create({
      actorEmail: controllerEmail,
      actorRole: 'controller',
      action: action === 'suspend' ? 'IssuerAccountSuspended' : 'IssuerAccountReactivated',
      targetType: 'issuer',
      targetId: issuer._id.toString(),
      targetReference: `${issuer.name} (${issuer.email})`,
      outcome: 'success',
      details: `${action === 'suspend' ? 'Suspended' : 'Reactivated'} by Controller. Reason: ${
        reason || 'Administrative action'
      }. Note: Previously issued certificates remain intact per institutional policy.`,
      ipAddress: '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      message: `Issuer account for ${issuer.name} is now ${newStatus}. Previously issued certificates remain valid.`,
      issuer: {
        id: issuer._id.toString(),
        accountStatus: newStatus,
      },
    });
  } catch (error) {
    console.error('Failed to update issuer account status:', error);
    return NextResponse.json(
      {
        error: 'Internal error updating issuer status.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
