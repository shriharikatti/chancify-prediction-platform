'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PredictionCard from '../../components/cards/PredictionCard';
import AddMoney from '../../components/ui/AddMoney';
import toast, { Toaster } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  walletBalance: number;
  totalPredictions: number;
  correctPredictions: number;
  totalWinnings: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
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
      const response = await fetch('/api/predictions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      toast.error('Failed to fetch predictions');
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/auth/login');
    }
    fetchPredictions().finally(() => setLoading(false));

    const interval = setInterval(fetchPredictions, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const handleVoteSuccess = () => {
    fetchPredictions();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const filteredPredictions =
    activeCategory === 'ALL'
      ? predictions
      : predictions.filter((p) => p.category === activeCategory);

  const winRate =
    user.totalPredictions > 0
      ? ((user.correctPredictions / user.totalPredictions) * 100).toFixed(1)
      : '0';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ✅ ROLE-BASED HEADER */}
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
              <div>
                <h1 className="text-2xl font-bold text-white">ChanciFy</h1>
                <p className="text-sm text-gray-400">
                  {user.role === 'ADMIN'
                    ? '👨‍💼 Admin Dashboard'
                    : '🎯 User Dashboard'}
                </p>
              </div>
            </div>

            {/* ✅ CONDITIONAL HEADER CONTENT BASED ON ROLE */}
            <div className="flex items-center space-x-6">
              {/* ✅ ONLY SHOW WALLET FOR USERS */}
              {user.role === 'USER' && (
                <>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                    <div className="text-center">
                      <p className="text-green-400 text-xs font-medium">
                        WALLET BALANCE
                      </p>
                      <p className="text-white text-xl font-bold">
                        ₹{user.walletBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <AddMoney
                    onSuccess={(newBalance) => {
                      setUser((prev) =>
                        prev ? { ...prev, walletBalance: newBalance } : null
                      );
                    }}
                  />
                </>
              )}

              {/* ✅ SHOW ADMIN TOOLS FOR ADMIN */}
              {user.role === 'ADMIN' && (
                <a
                  href="/admin"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Predictions
                </a>
              )}

              <button
                onClick={() => router.push('/profile')}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>My Profile</span>
              </button>

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
        {/* ✅ ROLE-BASED WELCOME SECTION */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2 animate-text-glow">
            {user.role === 'ADMIN'
              ? `Welcome back, Admin ${user.name || user.email}! 👨‍💼`
              : `Welcome back, ${user.name || user.email}! 🚀`}
          </h2>
          <p className="text-gray-300 text-lg">
            {user.role === 'ADMIN'
              ? 'Manage predictions and monitor platform activity.'
              : "Ready to make some predictions? Let's see what the future holds."}
          </p>
        </div>

        {/* ✅ USER STATS - ONLY FOR USERS */}
        {user.role === 'USER' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div
              className={`bg-[var(--surface)] p-6 rounded-xl border transition-all ${
                user.walletBalance < 50
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-gray-700 hover:border-[var(--primary)]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Wallet Balance</p>
                  <p
                    className={`text-3xl font-bold ${
                      user.walletBalance < 50 ? 'text-red-400' : 'text-white'
                    }`}
                  >
                    ₹{user.walletBalance.toFixed(2)}
                  </p>
                  {user.walletBalance < 50 && (
                    <p className="text-red-400 text-xs mt-1">
                      ⚠️ Low balance - Add money to continue betting
                    </p>
                  )}
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    user.walletBalance < 50
                      ? 'bg-red-500/20'
                      : 'bg-green-500/20'
                  }`}
                >
                  <svg
                    className={`w-6 h-6 ${
                      user.walletBalance < 50
                        ? 'text-red-500'
                        : 'text-green-500'
                    }`}
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
                      d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ ADMIN STATS - ONLY FOR ADMIN */}
        {user.role === 'ADMIN' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-700 hover:border-[var(--primary)]/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Users</p>
                  <p className="text-3xl font-bold text-white">1,247</p>
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-700 hover:border-[var(--primary)]/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Active Predictions</p>
                  <p className="text-3xl font-bold text-white">
                    {predictions.length}
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-700 hover:border-[var(--primary)]/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Bets Today</p>
                  <p className="text-3xl font-bold text-white">356</p>
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
                  <p className="text-sm text-gray-300">Platform Revenue</p>
                  <p className="text-3xl font-bold text-white">₹45,230</p>
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ ADMIN NOTICE */}
        {user.role === 'ADMIN' && (
          <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.228 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-orange-200">
                <strong>Admin Notice:</strong> You can create and manage
                predictions, but cannot place bets to avoid conflicts of
                interest.
              </p>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            {user.role === 'ADMIN'
              ? 'All Predictions (Platform Overview)'
              : 'Live Predictions'}
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

        {/* ✅ PREDICTIONS GRID WITH isAdmin PROP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPredictions.map((prediction) => (
            <div key={prediction.id} className="relative">
              <PredictionCard
                prediction={prediction}
                onVoteSuccess={handleVoteSuccess}
                isAdmin={user.role === 'ADMIN'} // ✅ Pass isAdmin prop
              />
              {user.role === 'ADMIN' && (
                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  ADMIN VIEW
                </div>
              )}
            </div>
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
                ? user.role === 'ADMIN'
                  ? 'Create your first prediction!'
                  : 'No active predictions available right now.'
                : `No active predictions in ${activeCategory} category.`}
            </p>
          </div>
        )}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
