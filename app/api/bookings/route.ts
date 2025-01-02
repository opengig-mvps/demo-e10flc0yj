import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email-service';

type BookingRequestBody = {
  listingId: string;
  userId: string;
  startDate: string;
  endDate: string;
  paymentId: string;
};

export async function POST(request: Request) {
  try {
    const body: BookingRequestBody = await request.json();
    const { listingId, userId, startDate, endDate, paymentId } = body;

    if (!listingId || !userId || !startDate || !endDate || !paymentId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [listing, user, payment] = await Promise.all([
      prisma.listing.findFirst({ where: { id: listingId } }),
      prisma.user.findFirst({ where: { id: userId } }),
      prisma.payment.findFirst({ where: { id: paymentId } }),
    ]);

    if (!listing) {
      return NextResponse.json(
        { success: false, message: 'Listing not found' },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (!payment || payment.paymentStatus !== 'completed') {
      return NextResponse.json(
        { success: false, message: 'Payment not found or not completed' },
        { status: 404 }
      );
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        listingId,
        OR: [
          {
            startDate: {
              lte: new Date(endDate),
            },
            endDate: {
              gte: new Date(startDate),
            },
          },
        ],
      },
    });

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Listing not available for the selected dates' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        listingId,
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        paymentId,
      },
    });

    await sendEmail({
      to: user.email,
      template: {
        subject: 'Booking Confirmation',
        html: `<h1>Booking Confirmed</h1><p>Your booking for listing ${listingId} is confirmed from ${startDate} to ${endDate}.</p>`,
        text: `Booking Confirmed. Your booking for listing ${listingId} is confirmed from ${startDate} to ${endDate}.`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        data: {
          bookingId: booking.id,
          listingId,
          userId,
          startDate,
          endDate,
          paymentId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 }
    );
  }
}