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

interface PredictionCardProps {
  prediction: Prediction;
  onVoteSuccess?: () => void;
}

export default function PredictionCard({
  prediction,
  onVoteSuccess,
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
    setSelectedChoice(choice);
    setShowVoteModal(true);
  };

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChoice || !amount) return;

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
          amount: parseFloat(amount),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Vote failed');
      }

      toast.success('Vote placed successfully!');
      setShowVoteModal(false);
      setAmount('');
      onVoteSuccess?.();

      // Update localStorage with new balance (simplified)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.walletBalance -= parseFloat(amount);
      localStorage.setItem('user', JSON.stringify(user));
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

        {/* Voting Buttons */}
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

        {/* Stats */}
        <div className="flex justify-between text-sm text-gray-400">
          <span>{prediction.totalVotes} votes</span>
          <span>₹{prediction.totalAmount.toFixed(0)} pool</span>
        </div>
      </div>

      {/* Vote Modal */}
      {showVoteModal && (
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
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
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
