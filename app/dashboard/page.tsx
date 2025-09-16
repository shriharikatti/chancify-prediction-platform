'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PredictionCard from '../../components/cards/PredictionCard';
import toast, { Toaster } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name?: string;
  walletBalance: number;
  totalPredictions: number;
  correctPredictions: number;
  totalWinnings: number;
}

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

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const router = useRouter();

  const categories = [
    'ALL',
    'SPORTS',
    'POLITICS',
    'ENTERTAINMENT',
    'TECHNOLOGY',
    'FINANCE',
  ];

  const fetchPredictions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/predictions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch predictions');
      }

      setPredictions(data.predictions);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch predictions');
    }
  };

  const fetchUserProfile = async () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchPredictions().finally(() => setLoading(false));

    // Auto-refresh predictions every 30 seconds
    const interval = setInterval(fetchPredictions, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const handleVoteSuccess = () => {
    fetchPredictions();
    // Update user balance from localStorage (updated in PredictionCard)
    const updatedUser = localStorage.getItem('user');
    if (updatedUser) {
      setUser(JSON.parse(updatedUser));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const filteredPredictions =
    activeCategory === 'ALL'
      ? predictions
      : predictions.filter((p) => p.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading predictions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const winRate =
    user.totalPredictions > 0
      ? ((user.correctPredictions / user.totalPredictions) * 100).toFixed(1)
      : '0';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--surface)] border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">ChanciFy</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-300">Wallet Balance</p>
                <p className="text-xl font-bold text-white">
                  ₹{user.walletBalance.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2 animate-text-glow">
            Welcome back, {user.name || user.email}! 🚀
          </h2>
          <p className="text-gray-300 text-lg">
            Ready to make some predictions? Let&apos;s see what the future
            holds.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-700 hover:border-[var(--primary)]/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Wallet Balance</p>
                <p className="text-3xl font-bold text-white">
                  ₹{user.walletBalance.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-700 hover:border-[var(--primary)]/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Predictions</p>
                <p className="text-3xl font-bold text-white">
                  {user.totalPredictions}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-700 hover:border-[var(--primary)]/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Win Rate</p>
                <p className="text-3xl font-bold text-white">{winRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-700 hover:border-[var(--primary)]/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Winnings</p>
                <p className="text-3xl font-bold text-white">
                  ₹{user.totalWinnings.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V4.5a2 2 0 00-2 0v1m2 0V6a2 2 0 00-2 0v1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            Live Predictions
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Predictions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPredictions.map((prediction) => (
            <PredictionCard
              key={prediction.id}
              prediction={prediction}
              onVoteSuccess={handleVoteSuccess}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredPredictions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.077-2.33"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No predictions found
            </h3>
            <p className="text-gray-400">
              {activeCategory === 'ALL'
                ? 'No active predictions available right now.'
                : `No active predictions in ${activeCategory} category.`}
            </p>
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="fixed bottom-4 right-4 bg-[var(--surface)] px-4 py-2 rounded-lg border border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Live updates</span>
          </div>
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'white',
            border: '1px solid #374151',
          },
        }}
      />
    </div>
  );
}
