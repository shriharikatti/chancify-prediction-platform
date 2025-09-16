import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { getAuthenticatedUser } from '../../../../../lib/middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // CRITICAL: Block admin from betting
    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true, walletBalance: true },
    });

    if (fullUser?.role === 'ADMIN') {
      return NextResponse.json(
        {
          error:
            'Admins cannot place bets on predictions. This prevents conflicts of interest.',
        },
        { status: 403 }
      );
    }

    const { choice, amount } = await request.json();
    const predictionId = params.id;

    // Validate input
    if (!['YES', 'NO'].includes(choice)) {
      return NextResponse.json({ error: 'Invalid choice' }, { status: 400 });
    }

    if (amount <= 0 || amount > 10000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Check if user has sufficient balance
    if (user.walletBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Check if prediction exists and is active
    const prediction = await db.prediction.findUnique({
      where: { id: predictionId },
    });

    if (
      !prediction ||
      prediction.status !== 'ACTIVE' ||
      prediction.endTime < new Date()
    ) {
      return NextResponse.json(
        { error: 'Prediction not available' },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = await db.vote.findUnique({
      where: {
        userId_predictionId: {
          userId: user.id,
          predictionId: predictionId,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this prediction' },
        { status: 400 }
      );
    }

    // Calculate potential payout
    const odds = choice === 'YES' ? prediction.yesOdds : prediction.noOdds;
    const potentialPayout = amount * odds;

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (prisma) => {
      // Create vote
      const vote = await prisma.vote.create({
        data: {
          userId: user.id,
          predictionId: predictionId,
          choice: choice,
          amount: amount,
          potentialPayout: potentialPayout,
        },
      });

      // Update user wallet balance
      await prisma.user.update({
        where: { id: user.id },
        data: {
          walletBalance: { decrement: amount },
          totalPredictions: { increment: 1 },
        },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'BET_PLACED',
          amount: -amount,
          description: `Bet placed on: ${prediction.question}`,
          status: 'COMPLETED',
        },
      });

      // Update prediction totals
      const updateData =
        choice === 'YES'
          ? { totalYesAmount: { increment: amount } }
          : { totalNoAmount: { increment: amount } };

      await prisma.prediction.update({
        where: { id: predictionId },
        data: updateData,
      });

      return vote;
    });

    return NextResponse.json({
      success: true,
      vote: result,
      message: 'Vote placed successfully!',
    });
  } catch (error) {
    console.error('Vote creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
