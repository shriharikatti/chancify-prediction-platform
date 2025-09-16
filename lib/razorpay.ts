import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export function generateReceiptId(): string {
  return `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
