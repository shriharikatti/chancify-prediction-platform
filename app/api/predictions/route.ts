import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getAuthenticatedUser } from '../../../lib/middleware';
import { requireAdmin } from '../../../lib/rbac';

export async function GET(request: NextRequest) {
  try {
    // Get active predictions
    const predictions = await db.prediction.findMany({
      where: {
        status: 'ACTIVE',
        endTime: { gt: new Date() },
      },
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

    // Calculate vote counts and percentages
    const predictionsWithStats = predictions.map((prediction) => {
      const yesVotes = prediction.votes.filter((v) => v.choice === 'YES');
      const noVotes = prediction.votes.filter((v) => v.choice === 'NO');

      const yesAmount = yesVotes.reduce((sum, vote) => sum + vote.amount, 0);
      const noAmount = noVotes.reduce((sum, vote) => sum + vote.amount, 0);
      const totalAmount = yesAmount + noAmount;

      const yesPercentage =
        totalAmount > 0 ? (yesAmount / totalAmount) * 100 : 50;
      const noPercentage =
        totalAmount > 0 ? (noAmount / totalAmount) * 100 : 50;

      return {
        ...prediction,
        yesVotes: yesVotes.length,
        noVotes: noVotes.length,
        totalVotes: yesVotes.length + noVotes.length,
        yesPercentage: Math.round(yesPercentage),
        noPercentage: Math.round(noPercentage),
        totalAmount,
        votes: undefined, // Remove detailed votes from response
      };
    });

    return NextResponse.json({ predictions: predictionsWithStats });
  } catch (error) {
    console.error('Predictions fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin role
    await requireAdmin(request);

    const body = await request.json();
    const { question, description, category, endTime, imageUrl } = body;

    const prediction = await db.prediction.create({
      data: {
        question,
        description,
        category,
        endTime: new Date(endTime),
        imageUrl,
        status: 'ACTIVE',
        yesOdds: 1.8,
        noOdds: 1.8,
      },
    });

    return NextResponse.json({ prediction });
  } catch (error: any) {
    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    console.error('Create prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
