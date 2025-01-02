import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email-service';

type PasswordRecoveryRequestBody = {
  email: string;
};

export async function POST(request: Request) {
  try {
    const body: PasswordRecoveryRequestBody = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    const token = Math.random().toString(36).substr(2);

    await sendEmail({
      to: email,
      template: {
        subject: 'Password Recovery',
        html: `<p>Please use the following token to reset your password: ${token}</p>`,
        text: `Please use the following token to reset your password: ${token}`,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Password recovery email sent' },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error sending password recovery email:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}