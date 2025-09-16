'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MyBets from '../../components/ui/MyBets';
import MyTransactions from '../../components/ui/MyTransactions';
import MyCreatedPredictions from '../../components/ui/MyCreatedPredictions';
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
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/auth/login');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!user) return null;

  const winRate =
    user.totalPredictions > 0
      ? ((user.correctPredictions / user.totalPredictions) * 100).toFixed(1)
      : '0';

  const tabs = [
    { id: 'profile', label: '👤 Profile Details', icon: '👤' },
    ...(user.role === 'USER'
      ? [
          { id: 'bets', label: '🎯 My Bets', icon: '🎯' },
          { id: 'transactions', label: '💳 Payments', icon: '💳' },
        ]
      : []),
    ...(user.role === 'ADMIN'
      ? [{ id: 'predictions', label: '⚡ My Predictions', icon: '⚡' }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-gray-700 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-gray-300">
              {user.role === 'ADMIN'
                ? 'Admin Account Management'
                : 'Account & Betting History'}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-gray-700 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white font-bold">
                    {user.name
                      ? user.name[0].toUpperCase()
                      : user.email[0].toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {user.name || 'User'}
                </h3>
                <p className="text-gray-300">{user.email}</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    user.role === 'ADMIN'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {user.role === 'ADMIN' ? '👨‍💼 Admin' : '🎯 User'}
                </span>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-[var(--surface)] rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Profile Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Full Name
                    </label>
                    <p className="text-white text-lg">
                      {user.name || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Email Address
                    </label>
                    <p className="text-white text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Account Type
                    </label>
                    <p className="text-white text-lg">
                      {user.role === 'ADMIN'
                        ? '👨‍💼 Administrator'
                        : '🎯 Regular User'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Member Since
                    </label>
                    <p className="text-white text-lg">
                      {new Date(
                        user.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Stats Summary */}
                <h3 className="text-xl font-bold text-white mb-4">
                  Account Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {user.role === 'USER' && (
                    <>
                      <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                        <p className="text-gray-300 text-sm">Wallet Balance</p>
                        <p className="text-white text-xl font-bold">
                          ₹{user.walletBalance.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                        <p className="text-gray-300 text-sm">Total Bets</p>
                        <p className="text-white text-xl font-bold">
                          {user.totalPredictions}
                        </p>
                      </div>
                      <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                        <p className="text-gray-300 text-sm">Win Rate</p>
                        <p className="text-white text-xl font-bold">
                          {winRate}%
                        </p>
                      </div>
                      <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                        <p className="text-gray-300 text-sm">Total Winnings</p>
                        <p className="text-white text-xl font-bold">
                          ₹{user.totalWinnings.toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}

                  {user.role === 'ADMIN' && (
                    <div className="bg-gray-700/50 p-4 rounded-lg text-center col-span-2">
                      <p className="text-gray-300 text-sm">Platform Role</p>
                      <p className="text-green-400 text-xl font-bold">
                        Administrator
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Manage predictions & platform
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bets' && user.role === 'USER' && <MyBets />}

            {activeTab === 'transactions' && user.role === 'USER' && (
              <MyTransactions />
            )}

            {activeTab === 'predictions' && user.role === 'ADMIN' && (
              <MyCreatedPredictions />
            )}
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
