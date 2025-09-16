import { NextResponse } from 'next/server';
import { seedPredictions } from '../../../../lib/seedData';

export async function POST() {
  try {
    await seedPredictions();
    return NextResponse.json({ message: 'Data seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
  }
}
