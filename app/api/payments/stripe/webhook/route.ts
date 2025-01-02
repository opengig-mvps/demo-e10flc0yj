import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email-service';
import { Readable } from 'stream';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});


async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: any) {
  try {
    const buf = await buffer(request);
    const sig = request.headers.get('stripe-signature')!;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: `Webhook Error: ${err?.message}` },
        { status: 400 },
      );
    }

    if (event?.type === 'payment_intent.succeeded') {
      const paymentIntent = event?.data?.object as Stripe.PaymentIntent;
      const userId = paymentIntent?.metadata?.userId;
      const amount = paymentIntent?.amount_received / 100;

      await prisma.payment.create({
        data: {
          id: paymentIntent?.id,
          amount,
          paymentStatus: 'succeeded',
          paymentDate: new Date(paymentIntent?.created * 1000).toISOString(),
          userId,
        },
      });

      await prisma.buyerDashboard.updateMany({
        where: { userId },
        data: {
          totalSpent: { increment: amount },
          totalBookings: { increment: 1 },
        },
      });

      await sendEmail({
        to: paymentIntent?.receipt_email!,
        template: {
          subject: 'Payment Successful',
          html: '<h1>Your payment was successful!</h1>',
          text: 'Your payment was successful!',
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Webhook received' }, { status: 200 });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
