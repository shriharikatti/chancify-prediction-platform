import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { getAuthenticatedUser } from '../../../../../lib/middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authorization
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (fullUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { result } = await request.json();
    const predictionId = params.id;

    if (!['YES', 'NO', 'CANCELLED'].includes(result)) {
      return NextResponse.json(
        { error: 'Invalid result. Must be YES, NO, or CANCELLED' },
        { status: 400 }
      );
    }

    // Check if prediction exists and can be resolved
    const prediction = await db.prediction.findUnique({
      where: { id: predictionId },
      include: {
        votes: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    if (prediction.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Prediction has already been resolved' },
        { status: 400 }
      );
    }

    // Process resolution and distribute rewards in a transaction
    const resolutionResult = await db.$transaction(async (prisma) => {
      // Update prediction status
      await prisma.prediction.update({
        where: { id: predictionId },
        data: {
          status: 'RESOLVED',
          result: result,
          resultTime: new Date(),
          updatedAt: new Date(),
        },
      });

      let winnersCount = 0;
      let totalPayout = 0;
      let refundedCount = 0;
      let totalRefunded = 0;

      // Process each vote
      for (const vote of prediction.votes) {
        if (result === 'CANCELLED') {
          // CANCELLED: Refund all bets
          await prisma.user.update({
            where: { id: vote.userId },
            data: {
              walletBalance: { increment: vote.amount },
            },
          });

          await prisma.vote.update({
            where: { id: vote.id },
            data: {
              actualPayout: vote.amount,
              status: 'REFUNDED',
            },
          });

          await prisma.transaction.create({
            data: {
              userId: vote.userId,
              type: 'BET_REFUNDED',
              amount: vote.amount,
              description: `Bet refunded: ${prediction.question} (Cancelled)`,
              status: 'COMPLETED',
            },
          });

          refundedCount++;
          totalRefunded += vote.amount;
        } else if (vote.choice === result) {
          // WINNER: Pay out the full potential payout
          const payout = vote.potentialPayout;

          await prisma.user.update({
            where: { id: vote.userId },
            data: {
              walletBalance: { increment: payout },
              correctPredictions: { increment: 1 },
              totalWinnings: { increment: payout - vote.amount },
            },
          });

          await prisma.vote.update({
            where: { id: vote.id },
            data: {
              actualPayout: payout,
              status: 'WON',
            },
          });

          await prisma.transaction.create({
            data: {
              userId: vote.userId,
              type: 'BET_WON',
              amount: payout,
              description: `🎉 Prediction won: "${prediction.question}" - ${vote.choice} was correct!`,
              status: 'COMPLETED',
            },
          });

          winnersCount++;
          totalPayout += payout;
        } else {
          // LOSER: No payout, just mark as lost
          await prisma.vote.update({
            where: { id: vote.id },
            data: {
              actualPayout: 0,
              status: 'LOST',
            },
          });

          await prisma.transaction.create({
            data: {
              userId: vote.userId,
              type: 'BET_LOST',
              amount: 0,
              description: `Prediction lost: "${prediction.question}" - ${vote.choice} was incorrect`,
              status: 'COMPLETED',
            },
          });
        }
      }

      return {
        winnersCount: result === 'CANCELLED' ? refundedCount : winnersCount,
        totalPayout: result === 'CANCELLED' ? totalRefunded : totalPayout,
        result,
        predictionTitle: prediction.question,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Prediction resolved as ${result}`,
      winnersCount: resolutionResult.winnersCount,
      totalPayout: resolutionResult.totalPayout,
      result: resolutionResult.result,
    });
  } catch (error) {
    console.error('Resolve prediction error:', error);
    return NextResponse.json(
      {
        error: 'Failed to resolve prediction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
