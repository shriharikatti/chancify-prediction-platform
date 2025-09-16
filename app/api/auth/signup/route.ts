import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import {
  hashPassword,
  generateVerificationToken,
  signToken,
} from '../../../../lib/auth';
import { signupSchema } from '../../../../lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = signupSchema.parse(body);
    const { email, password, name } = validatedData;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: validatedData.role || 'USER',
        emailVerifyToken: verificationToken,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        walletBalance: true,
      },
    });

    // Generate JWT token
    const token = signToken({ userId: user.id, email: user.email });

    // TODO: Send verification email here
    console.log(`Verification token for ${email}: ${verificationToken}`);

    return NextResponse.json({
      message: 'User created successfully',
      user,
      token,
      verificationSent: true,
    });
  } catch (error: any) {
    console.error('Signup error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
