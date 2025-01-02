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

export async function POST(request: Request) {
  try {
    const body: ListingRequestBody = await request.json();
    const { title, description, price, availability, amenities, images } = body;

    if (!title || !description || !price || !availability || !amenities || !images) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price.toString()),
        availability,
        amenities,
        images,
        vendorId: 'some-vendor-id',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Listing created successfully',
        data: {
          listingId: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          availability: listing.availability,
          amenities: listing.amenities,
          images: listing.images,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 }
    );
  }
}