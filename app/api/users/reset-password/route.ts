import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

type ResetPasswordRequestBody = {
  token: string;
  newPassword: string;
};

export async function POST(request: Request) {
  try {
    const body: ResetPasswordRequestBody = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { email: token }, // Assuming token is stored in email field for the sake of example
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid or expired reset token' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user?.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: 'Password reset successful' }, { status: 200 });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}