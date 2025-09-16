import { NextRequest, NextResponse } from 'next/server';
import { createHash, createHmac } from 'crypto';
import { db } from '../../../../lib/db';
import { getAuthenticatedUser } from '../../../../lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          error: 'Missing payment verification parameters',
        },
        { status: 400 }
      );
    }

    // CRITICAL FIX: Correct signature verification
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    // Debug logging (remove in production)
    console.log('Verification details:', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      expectedSignature,
      secret: secret.substring(0, 10) + '...', // Only log first 10 chars for security
    });

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature verification failed');
      return NextResponse.json(
        {
          error: 'Invalid signature',
        },
        { status: 400 }
      );
    }

    // Find the transaction
    const transaction = await db.transaction.findFirst({
      where: {
        razorpayId: razorpay_order_id,
        userId: user.id,
        status: 'PENDING',
      },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          error: 'Transaction not found',
        },
        { status: 404 }
      );
    }

    // Update transaction and user balance in a single database transaction
    await db.$transaction(async (prisma) => {
      // Update transaction status
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          razorpayId: razorpay_payment_id, // Store payment ID
        },
      });

      // Update user wallet balance
      await prisma.user.update({
        where: { id: user.id },
        data: {
          walletBalance: { increment: transaction.amount },
        },
      });
    });

    // Get updated user data
    const updatedUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        walletBalance: true,
        totalPredictions: true,
        correctPredictions: true,
        totalWinnings: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      {
        error: 'Payment verification failed',
      },
      { status: 500 }
    );
  }
}
