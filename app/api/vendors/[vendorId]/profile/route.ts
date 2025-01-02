import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type VendorProfileRequestBody = {
  businessName: string;
  contactInfo: string;
  logoUrl: string;
};

export async function POST(
  request: Request,
  { params }: { params: { vendorId: string } },
) {
  try {
    const vendorId = params.vendorId;

    const body: VendorProfileRequestBody = await request.json();

    const { businessName, contactInfo, logoUrl } = body;

    if (!businessName || !contactInfo || !logoUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const vendorProfile = await prisma.vendorProfile.update({
      where: { userId: vendorId },
      data: {
        businessName,
        contactInfo,
        logoUrl,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Vendor profile updated successfully',
        data: {
          vendorId,
          businessName,
          contactInfo,
          logoUrl,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error updating vendor profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}