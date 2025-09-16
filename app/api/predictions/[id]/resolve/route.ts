import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/rbac';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const { result } = await request.json(); // 'YES', 'NO', or 'CANCELLED'
    const predictionId = params.id;

    if (!['YES', 'NO', 'CANCELLED'].includes(result)) {
      return NextResponse.json({ error: 'Invalid result' }, { status: 400 });
    }

    // Process rewards in a transaction
    await db.$transaction(async (prisma) => {
      // Update prediction status
      await prisma.prediction.update({
        where: { id: predictionId },
        data: {
          status: 'RESOLVED',
          result: result,
          resultTime: new Date(),
        },
      });

      // Get all votes for this prediction
      const votes = await prisma.vote.findMany({
        where: { predictionId },
        include: { user: true },
      });

      // Process payouts
      for (const vote of votes) {
        if (result === 'CANCELLED') {
          // Refund all bets
          await prisma.user.update({
            where: { id: vote.userId },
            data: {
              walletBalance: { increment: vote.amount },
            },
          });

          await prisma.vote.update({
            where: { id: vote.id },
            data: { actualPayout: vote.amount },
          });

          await prisma.transaction.create({
            data: {
              userId: vote.userId,
              type: 'BET_REFUNDED',
              amount: vote.amount,
              description: `Bet refunded: Prediction cancelled`,
              status: 'COMPLETED',
            },
          });
        } else if (vote.choice === result) {
          // Winner - pay out
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
            data: { actualPayout: payout },
          });

          await prisma.transaction.create({
            data: {
              userId: vote.userId,
              type: 'BET_WON',
              amount: payout,
              description: `Prediction won: ${vote.choice} was correct!`,
              status: 'COMPLETED',
            },
          });
        } else {
          // Loser - no payout, just mark as resolved
          await prisma.vote.update({
            where: { id: vote.id },
            data: { actualPayout: 0 },
          });
        }
      }
    });

    return NextResponse.json({
      message: 'Prediction resolved and rewards distributed',
    });
  } catch (error: any) {
    console.error('Resolve prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve prediction' },
      { status: 500 }
    );
  }
}
