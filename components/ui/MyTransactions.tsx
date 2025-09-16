'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

export default function MyTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setTransactions(data.transactions);
      } else {
        toast.error(data.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return '💰';
      case 'BET_PLACED':
        return '🎯';
      case 'BET_WON':
        return '🏆';
      case 'BET_REFUNDED':
        return '↩️';
      default:
        return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'text-green-400';
      case 'BET_WON':
        return 'text-green-400';
      case 'BET_PLACED':
        return 'text-red-400';
      case 'BET_REFUNDED':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--surface)] rounded-xl p-6 border border-gray-700">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] rounded-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Payment History</h2>

      {transactions.length === 0 ? (
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"
              />
            </svg>
          </div>
          <p className="text-gray-300">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getTransactionIcon(transaction.type)}
                  </span>
                  <div>
                    <h3 className="text-white font-medium">
                      {transaction.description}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${getTransactionColor(
                      transaction.type
                    )}`}
                  >
                    {transaction.type === 'BET_PLACED' ? '-' : '+'}₹
                    {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      transaction.status === 'COMPLETED'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
