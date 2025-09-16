import { db } from './db';
import { Category } from '@prisma/client';

const predictions = [
  {
    question: 'Will India win the Cricket World Cup 2024?',
    description: "India's performance in the upcoming Cricket World Cup",
    category: Category.SPORTS,
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
  {
    question: 'Will Bitcoin reach $100,000 by end of 2024?',
    description: 'Bitcoin price prediction for the rest of 2024',
    category: Category.FINANCE,
    endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
  },
  {
    question: 'Will OpenAI release GPT-5 in 2024?',
    description: 'Next generation of ChatGPT expected this year',
    category: Category.TECHNOLOGY,
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
  },
];

export async function seedPredictions() {
  for (const pred of predictions) {
    await db.prediction.create({
      data: {
        ...pred,
        status: 'ACTIVE',
        yesOdds: 1.8,
        noOdds: 1.8,
      },
    });
  }
}

seedPredictions().catch((e) => {
  console.error(e);
  process.exit(1);
});
