import { NextRequest, NextResponse } from 'next/server';
import { razorpay, generateReceiptId } from '../../../../lib/razorpay';
import { getAuthenticatedUser } from '../../../../lib/middleware';
import { db } from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount < 10 || amount > 100000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: generateReceiptId(),
      notes: {
        userId: user.id,
        email: user.email,
      },
    });

    // Create transaction record
    await db.transaction.create({
      data: {
        userId: user.id,
        type: 'DEPOSIT',
        amount: amount,
        description: `Wallet top-up via Razorpay`,
        razorpayId: order.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
