import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const location = url.searchParams.get('location');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const priceRange = url.searchParams.get('priceRange');
    const amenities = url.searchParams.get('amenities');

    const filters: any = {};

    if (location) {
      filters.location = location;
    }

    if (startDate && endDate) {
      filters.availability = {
        array_contains: {
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        },
      };
    }

    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-').map(Number);
      filters.price = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    if (amenities) {
      filters.amenities = {
        array_contains: amenities.split(','),
      };
    }

    const listings = await prisma.listing.findMany({
      where: filters,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        availability: true,
        amenities: true,
        images: true,
      },
    });

    const formattedListings = listings.map((listing: any) => ({
      listingId: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      availability: listing.availability,
      amenities: listing.amenities,
      images: listing.images,
    }));

    return NextResponse.json(
      {
        success: true,
        message: 'Listings fetched successfully',
        data: {
          listings: formattedListings,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}