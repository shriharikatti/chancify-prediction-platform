import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { generateVerificationToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        message:
          'If an account with that email exists, a reset link has been sent.',
      });
    }

    const resetToken = generateVerificationToken();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // TODO: Send email with reset link
    // For now, log the token (remove in production)
    console.log(`Reset token for ${email}: ${resetToken}`);
    console.log(
      `Reset link: http://localhost:3000/auth/reset-password?token=${resetToken}`
    );

    return NextResponse.json({
      message:
        'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
