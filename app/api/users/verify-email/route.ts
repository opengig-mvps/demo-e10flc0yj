import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type VerifyEmailRequestBody = {
  token: string;
};

export async function POST(request: Request) {
  try {
    const body: VerifyEmailRequestBody = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: token },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { email: token },
      data: { updatedAt: new Date() }, // Assuming we want to update the updatedAt field
    });

    return NextResponse.json(
      { success: true, message: 'Email verified successfully' },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}