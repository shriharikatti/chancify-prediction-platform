'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface AddMoneyProps {
  onSuccess: (newBalance: number) => void;
}

export default function AddMoney({ onSuccess }: AddMoneyProps) {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handleAddMoney = async (selectedAmount: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Create order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: selectedAmount }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ChanciFy',
        description: 'Add money to wallet',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            toast.loading('Verifying payment...', { id: 'payment-verify' });

            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            toast.dismiss('payment-verify');

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error || 'Payment verification failed'
              );
            }

            // Success handling
            localStorage.setItem('user', JSON.stringify(verifyData.user));
            toast.success(`₹${selectedAmount} added to wallet successfully!`);
            onSuccess(verifyData.user.walletBalance);
            setShowModal(false);
            setAmount('');
            window.location.reload();
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error(error.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled by user');
            setLoading(false);
          },
        },
        prefill: {
          name: 'ChanciFy User',
          email: JSON.parse(localStorage.getItem('user') || '{}').email,
        },
        theme: {
          color: '#2563eb',
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failure
      rzp.on('payment.failed', (response: any) => {
        toast.error('Payment failed: ' + response.error.description);
        setLoading(false);
      });

      rzp.open();
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const handleCustomAmount = () => {
    const customAmount = parseFloat(amount);
    if (customAmount < 10) {
      toast.error('Minimum amount is ₹10');
      return;
    }
    if (customAmount > 100000) {
      toast.error('Maximum amount is ₹1,00,000');
      return;
    }
    handleAddMoney(customAmount);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        data-add-money-button
        className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary)]/90 transition-colors font-medium disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Add Money'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-white text-xl font-semibold mb-6">
              Add Money to Wallet
            </h3>

            {/* Quick Amount Buttons */}
            <div className="mb-6">
              <p className="text-gray-300 text-sm mb-3">Quick Select:</p>
              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => handleAddMoney(quickAmount)}
                    disabled={loading}
                    className="bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                  >
                    ₹{quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-2">
                Custom Amount:
              </label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="10"
                  max="100000"
                  step="10"
                  placeholder="Enter amount"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  disabled={loading}
                />
                <button
                  onClick={handleCustomAmount}
                  disabled={loading || !amount}
                  className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Min: ₹10, Max: ₹1,00,000
              </p>
            </div>

            {amount && (
              <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                <p className="text-gray-300 text-sm">
                  Amount to add:{' '}
                  <span className="text-white font-semibold">₹{amount}</span>
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            {/* Security Note */}
            <p className="text-gray-400 text-xs mt-4 text-center">
              🔒 Payments are processed securely by Razorpay
            </p>
          </div>
        </div>
      )}
    </>
  );
}
