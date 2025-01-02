import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type BuyerProfileRequestBody = {
  paymentDetails: any;
};

export async function POST(
  request: Request,
  { params }: { params: { buyerId: string } },
) {
  try {
    const buyerId = params.buyerId;
    const body: BuyerProfileRequestBody = await request.json();
    const { paymentDetails } = body;

    if (!paymentDetails || typeof paymentDetails !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid payment details' },
        { status: 400 },
      );
    }

    const buyer = await prisma.user.findFirst({
      where: { id: buyerId, role: 'buyer' },
    });

    if (!buyer) {
      return NextResponse.json(
        { success: false, message: 'Buyer not found' },
        { status: 404 },
      );
    }

    const updatedProfile = await prisma.buyerProfile.updateMany({
      where: { userId: buyerId },
      data: { paymentDetails },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Buyer profile updated successfully',
        data: {
          buyerId: buyerId,
          paymentDetails: paymentDetails,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error updating buyer profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}