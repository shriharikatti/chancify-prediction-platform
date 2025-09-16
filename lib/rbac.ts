import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from './middleware';

export async function requireAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new Error('Authentication required');
  }

  // Check user role from database
  const { db } = await import('./db');
  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!fullUser || fullUser.role === 'USER') {
    throw new Error('Admin access required');
  }

  return user;
}

export async function requireSuperAdmin(request: NextRequest) {
  const user = await requireAdmin(request);
  const { db } = await import('./db');

  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (String(fullUser?.role) !== 'SUPER_ADMIN') {
    throw new Error('Super admin access required');
  }

  return user;
}
