'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Bet {
  id: string;
  choice: 'YES' | 'NO';
  amount: number;
  potentialPayout: number;
  actualPayout?: number;
  createdAt: string;
  prediction: {
    question: string;
    category: string;
    endTime: string;
    status: string;
    result?: 'YES' | 'NO' | 'CANCELLED';
  };
}

export default function MyBets() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/bets', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bets');
      }

      setBets(data.bets);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch bets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBets();
  }, []);

  const getBetStatus = (bet: Bet) => {
    if (bet.prediction.status === 'RESOLVED' && bet.prediction.result) {
      const won = bet.choice === bet.prediction.result;
      return won ? 'WON' : 'LOST';
    }
    if (bet.prediction.status === 'CANCELLED') return 'REFUNDED';
    if (new Date(bet.prediction.endTime) < new Date()) return 'ENDED';
    return 'ACTIVE';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WON':
        return 'text-green-400 bg-green-500/20';
      case 'LOST':
        return 'text-red-400 bg-red-500/20';
      case 'REFUNDED':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'ENDED':
        return 'text-gray-400 bg-gray-500/20';
      default:
        return 'text-blue-400 bg-blue-500/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--surface)] rounded-xl p-6 border border-gray-700">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your bets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] rounded-xl p-6 border border-gray-700">
      <h3 className="text-2xl font-bold text-white mb-6">My Betting History</h3>

      {bets.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-gray-300">No bets placed yet. Start predicting!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bets.map((bet) => {
            const status = getBetStatus(bet);
            const statusColor = getStatusColor(status);

            return (
              <div
                key={bet.id}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1 line-clamp-2">
                      {bet.prediction.question}
                    </h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-300">
                      <span className="bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-1 rounded">
                        {bet.prediction.category}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(bet.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Your Bet</p>
                    <p
                      className={`font-semibold ${
                        bet.choice === 'YES' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {bet.choice}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Amount</p>
                    <p className="text-white font-semibold">
                      ₹{bet.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Potential Win</p>
                    <p className="text-white font-semibold">
                      ₹{bet.potentialPayout.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Profit/Loss</p>
                    <p
                      className={`font-semibold ${
                        status === 'WON'
                          ? 'text-green-400'
                          : status === 'LOST'
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {status === 'WON'
                        ? `+₹${(bet.potentialPayout - bet.amount).toFixed(2)}`
                        : status === 'LOST'
                        ? `-₹${bet.amount.toFixed(2)}`
                        : status === 'REFUNDED'
                        ? '₹0.00'
                        : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
