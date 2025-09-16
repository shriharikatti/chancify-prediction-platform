import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getAuthenticatedUser } from '../../../../lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
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

    // Get predictions that can be resolved (ACTIVE status)
    const predictions = await db.prediction.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        votes: {
          select: {
            choice: true,
            amount: true,
          },
        },
      },
      orderBy: { endTime: 'asc' },
    });

    // Calculate statistics for each prediction
    const predictionsWithStats = predictions.map((prediction) => {
      const yesVotes = prediction.votes.filter((v) => v.choice === 'YES');
      const noVotes = prediction.votes.filter((v) => v.choice === 'NO');

      const totalVotes = prediction.votes.length;
      const yesVoteCount = yesVotes.length;
      const noVoteCount = noVotes.length;

      const yesAmount = yesVotes.reduce((sum, vote) => sum + vote.amount, 0);
      const noAmount = noVotes.reduce((sum, vote) => sum + vote.amount, 0);
      const totalAmount = yesAmount + noAmount;

      const yesPercentage =
        totalAmount > 0 ? Math.round((yesAmount / totalAmount) * 100) : 50;
      const noPercentage = 100 - yesPercentage;

      return {
        ...prediction,
        totalVotes,
        yesVotes: yesVoteCount,
        noVotes: noVoteCount,
        yesPercentage,
        noPercentage,
        totalAmount,
        votes: undefined, // Remove detailed votes from response
      };
    });

    return NextResponse.json({ predictions: predictionsWithStats });
  } catch (error) {
    console.error('Fetch resolvable predictions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
