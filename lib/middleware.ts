import { NextRequest } from 'next/server';
import { verifyToken } from './auth';
import { db } from './db';

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true,
        walletBalance: true,
        totalPredictions: true,
        correctPredictions: true,
        totalWinnings: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
