'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface Prediction {
  id: string;
  question: string;
  description?: string;
  category: string;
  endTime: string;
  yesOdds: number;
  noOdds: number;
  yesPercentage: number;
  noPercentage: number;
  totalVotes: number;
  totalAmount: number;
}

// ✅ Add isAdmin to the props interface
interface PredictionCardProps {
  prediction: Prediction;
  onVoteSuccess?: () => void;
  isAdmin?: boolean;
}

// ✅ Add isAdmin to destructuring with default value
export default function PredictionCard({
  prediction,
  onVoteSuccess,
  isAdmin = false,
}: PredictionCardProps) {
  const [voting, setVoting] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'YES' | 'NO' | null>(
    null
  );
  const [amount, setAmount] = useState('');

  const timeLeft = new Date(prediction.endTime).getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const minutesLeft = Math.max(
    0,
    Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  );

  const handleVoteClick = (choice: 'YES' | 'NO') => {
    // Check if admin
    if (isAdmin) {
      toast.error('Admins cannot place bets to avoid conflicts of interest');
      return;
    }

    // ✅ ADD BALANCE CHECK - Get current user balance
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userBalance = currentUser.walletBalance || 0;

    // Check minimum bet amount (₹10)
    if (userBalance < 10) {
      // ✅ SHOW INSUFFICIENT BALANCE MODAL
      showInsufficientBalanceModal(userBalance);
      return;
    }

    setSelectedChoice(choice);
    setShowVoteModal(true);
  };

  // ✅ ADD NEW FUNCTION FOR INSUFFICIENT BALANCE MODAL
  const showInsufficientBalanceModal = (currentBalance: number) => {
    // Create and show a custom modal for insufficient balance
    const modal = document.createElement('div');
    modal.className =
      'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
    <div class="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md border border-red-500/50">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.228 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Insufficient Balance!</h3>
        <p class="text-gray-300 mb-4">
          Your current balance is <span class="text-red-400 font-semibold">₹${currentBalance.toFixed(
            2
          )}</span>
          <br>Minimum bet amount is <span class="text-white font-semibold">₹10</span>
        </p>
        <p class="text-gray-300 mb-6">Add money to your wallet to start betting!</p>
        <div class="flex space-x-3">
          <button id="closeModal" class="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium">
            Cancel
          </button>
          <button id="addMoney" class="flex-1 bg-[var(--primary)] text-white py-3 rounded-lg hover:bg-[var(--primary)]/90 transition-colors font-medium">
            Add Money Now
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(modal);

    // Handle close modal
    modal.querySelector('#closeModal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    // ✅ REDIRECT TO ADD MONEY - Trigger Razorpay
    modal.querySelector('#addMoney')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      // Trigger the AddMoney component
      const addMoneyButton = document.querySelector(
        '[data-add-money-button]'
      ) as HTMLButtonElement;
      if (addMoneyButton) {
        addMoneyButton.click();
      } else {
        // Fallback: redirect to profile payments tab
        window.location.href = '/profile?tab=transactions';
      }
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChoice || !amount || isAdmin) return;

    const betAmount = parseFloat(amount);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userBalance = currentUser.walletBalance || 0;

    // ✅ REAL-TIME BALANCE CHECK
    if (userBalance < betAmount) {
      toast.error(
        `Insufficient balance! You have ₹${userBalance.toFixed(
          2
        )} but need ₹${betAmount.toFixed(2)}`
      );
      setShowVoteModal(false);
      showInsufficientBalanceModal(userBalance);
      return;
    }

    setVoting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/predictions/${prediction.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          choice: selectedChoice,
          amount: betAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // ✅ HANDLE API INSUFFICIENT BALANCE ERROR
        if (
          result.error.includes('Insufficient balance') ||
          result.error.includes('insufficient')
        ) {
          setShowVoteModal(false);
          showInsufficientBalanceModal(userBalance);
          return;
        }
        throw new Error(result.error || 'Vote failed');
      }

      toast.success('Vote placed successfully!');
      setShowVoteModal(false);
      setAmount('');
      onVoteSuccess?.();

      // Update localStorage with new balance
      const updatedUser = {
        ...currentUser,
        walletBalance: userBalance - betAmount,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      toast.error(error.message || 'Vote failed');
    } finally {
      setVoting(false);
    }
  };

  return (
    <>
      <div className="bg-[var(--surface)] rounded-xl p-6 border border-gray-700 hover:border-[var(--primary)]/50 transition-all duration-300">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="bg-[var(--primary)]/20 text-[var(--primary)] px-3 py-1 rounded-full text-sm font-medium">
            {prediction.category}
          </span>
          <span className="text-gray-400 text-sm">
            {hoursLeft}h {minutesLeft}m left
          </span>
        </div>

        {/* Question */}
        <h3 className="text-white text-lg font-semibold mb-3 leading-tight">
          {prediction.question}
        </h3>

        {/* Description */}
        {prediction.description && (
          <p className="text-gray-300 text-sm mb-4 opacity-80">
            {prediction.description}
          </p>
        )}

        {/* Vote Percentages */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>YES {prediction.yesPercentage}%</span>
            <span>NO {prediction.noPercentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${prediction.yesPercentage}%` }}
            />
          </div>
        </div>

        {/* ✅ Conditional Voting Buttons - Hide for Admin */}
        {!isAdmin ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleVoteClick('YES')}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex flex-col items-center"
            >
              <span className="text-lg">YES</span>
              <span className="text-sm opacity-90">{prediction.yesOdds}x</span>
            </button>
            <button
              onClick={() => handleVoteClick('NO')}
              className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex flex-col items-center"
            >
              <span className="text-lg">NO</span>
              <span className="text-sm opacity-90">{prediction.noOdds}x</span>
            </button>
          </div>
        ) : (
          // ✅ Admin Notice
          <div className="mb-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/50">
            <p className="text-orange-200 text-sm text-center">
              👨‍💼 Admin View - Betting disabled to prevent conflicts of interest
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between text-sm text-gray-400">
          <span>{prediction.totalVotes} votes</span>
          <span>₹{prediction.totalAmount.toFixed(0)} pool</span>
        </div>
      </div>

      {/* ✅ Vote Modal - Only show for non-admin users */}
      {showVoteModal && !isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-white text-xl font-semibold mb-4">
              Place Your Bet
            </h3>

            <div className="mb-4">
              <p className="text-gray-300 text-sm mb-2">Betting on:</p>
              <p className="text-white font-medium">{prediction.question}</p>
            </div>

            <div className="mb-4">
              <p className="text-gray-300 text-sm mb-2">Your choice:</p>
              <div
                className={`inline-block px-4 py-2 rounded-lg font-medium ${
                  selectedChoice === 'YES'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                }`}
              >
                {selectedChoice} (
                {selectedChoice === 'YES'
                  ? prediction.yesOdds
                  : prediction.noOdds}
                x)
              </div>
            </div>

            <form onSubmit={handleVoteSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">
                  Bet Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="10"
                  max="10000"
                  step="10"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Enter amount"
                  required
                />
              </div>

              {amount && (
                <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    Potential payout:{' '}
                    <span className="text-white font-semibold">
                      ₹
                      {(
                        parseFloat(amount) *
                        (selectedChoice === 'YES'
                          ? prediction.yesOdds
                          : prediction.noOdds)
                      ).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVoteModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={voting || !amount}
                  className="flex-1 bg-[var(--primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-colors"
                >
                  {voting ? 'Placing Bet...' : 'Place Bet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
