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

    // For now, return all predictions (in a real app, you'd track who created each)
    const predictions = await db.prediction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        votes: {
          select: {
            choice: true,
            amount: true,
          },
        },
      },
    });

    // Add computed stats
    const predictionsWithStats = predictions.map((prediction) => {
      const totalVotes = prediction.votes.length;
      const totalAmount = prediction.votes.reduce(
        (sum, vote) => sum + vote.amount,
        0
      );

      return {
        ...prediction,
        totalVotes,
        totalAmount,
        votes: undefined, // Remove detailed votes
      };
    });

    return NextResponse.json({ predictions: predictionsWithStats });
  } catch (error) {
    console.error('Fetch admin predictions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
