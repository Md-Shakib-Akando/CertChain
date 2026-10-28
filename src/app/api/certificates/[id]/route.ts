import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Certificate } from '@/models/Certificate';
import { verifyOnChainServer } from '@/lib/web3/serverWeb3';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    const cert = await Certificate.findOne({ id: cleanId }).select('-pdfBase64');
    if (!cert) {
      return NextResponse.json({ success: false, message: 'Certificate not found' }, { status: 404 });
    }

    // Also fetch on-chain state
    const onChainState = await verifyOnChainServer(cleanId);

    return NextResponse.json({
      success: true,
      certificate: cert,
      onChain: onChainState,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve certificate', error: (error as Error).message },
      { status: 500 }
    );
  }
}
