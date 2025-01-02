import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type ListingRequestBody = {
  title: string;
  description: string;
  price: number;
  availability: any;
  amenities: any;
  images: any;
};

export async function PUT(
  request: Request,
  { params }: { params: { listingId: string } },
) {
  try {
    const listingId = params.listingId;
    if (!listingId) {
      return NextResponse.json(
        { success: false, message: 'Invalid listing ID' },
        { status: 400 },
      );
    }

    const body: ListingRequestBody = await request.json();
    const { title, description, price, availability, amenities, images } = body;

    if (!title || !description || !price || !availability || !amenities || !images) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        title,
        description,
        price,
        availability,
        amenities,
        images,
        updatedAt: new Date(),
      },
    });

    if (!updatedListing) {
      return NextResponse.json(
        { success: false, message: 'Listing not found or not updated' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Listing updated successfully',
        data: updatedListing,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}