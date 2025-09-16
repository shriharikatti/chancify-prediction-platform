import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getAuthenticatedUser } from '../../../../lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bets = await db.vote.findMany({
      where: { userId: user.id },
      include: {
        prediction: {
          select: {
            question: true,
            category: true,
            endTime: true,
            status: true,
            result: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bets });
  } catch (error) {
    console.error('Fetch bets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
