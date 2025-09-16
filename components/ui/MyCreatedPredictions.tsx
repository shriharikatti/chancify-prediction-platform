'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Add proper TypeScript interface
interface Prediction {
  id: string;
  question: string;
  description?: string;
  category: 'SPORTS' | 'POLITICS' | 'ENTERTAINMENT' | 'TECHNOLOGY' | 'FINANCE';
  endTime: string;
  status: 'ACTIVE' | 'CLOSED' | 'RESOLVED' | 'CANCELLED';
  totalVotes: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export default function MyCreatedPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]); // Fix: Properly type the state
  const [loading, setLoading] = useState(true);

  const fetchMyPredictions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/my-predictions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setPredictions(data.predictions);
      } else {
        toast.error(data.error || 'Failed to fetch predictions');
      }
    } catch (error) {
      toast.error('Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPredictions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400';
      case 'RESOLVED':
        return 'bg-blue-500/20 text-blue-400';
      case 'CLOSED':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SPORTS':
        return '🏏';
      case 'POLITICS':
        return '🏛️';
      case 'ENTERTAINMENT':
        return '🎬';
      case 'TECHNOLOGY':
        return '💻';
      case 'FINANCE':
        return '💰';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--surface)] rounded-xl p-6 border border-gray-700">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          My Created Predictions
        </h2>
        <a
          href="/admin"
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
        >
          Create New
        </a>
      </div>

      {predictions.length === 0 ? (
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <p className="text-gray-300 mb-4">
            You haven&apos;t created any predictions yet
          </p>
          <a
            href="/admin"
            className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
          >
            Create Your First Prediction
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xl">
                      {getCategoryIcon(prediction.category)}
                    </span>
                    <span className="bg-[var(--primary)]/20 text-[var(--primary)] px-3 py-1 rounded-full text-sm font-medium">
                      {prediction.category}
                    </span>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-400 text-sm">
                      {new Date(prediction.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2 leading-tight">
                    {prediction.question}
                  </h3>
                  {prediction.description && (
                    <p className="text-gray-300 text-sm mb-3 opacity-80">
                      {prediction.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    prediction.status
                  )}`}
                >
                  {prediction.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <p className="text-gray-400 mb-1">Total Votes</p>
                  <p className="text-white text-xl font-bold">
                    {prediction.totalVotes}
                  </p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <p className="text-gray-400 mb-1">Total Pool</p>
                  <p className="text-white text-xl font-bold">
                    ₹{prediction.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <p className="text-gray-400 mb-1">End Date</p>
                  <p className="text-white font-semibold">
                    {new Date(prediction.endTime).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <p className="text-gray-400 mb-1">Time Left</p>
                  <p className="text-white font-semibold">
                    {new Date(prediction.endTime).getTime() > Date.now()
                      ? `${Math.ceil(
                          (new Date(prediction.endTime).getTime() -
                            Date.now()) /
                            (1000 * 60 * 60 * 24)
                        )}d`
                      : 'Ended'}
                  </p>
                </div>
              </div>

              {prediction.status === 'ACTIVE' && (
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      // TODO: Add resolve prediction functionality
                      toast('Resolve functionality coming soon!');
                    }}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Resolve Prediction
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {predictions.length > 0 && (
        <div className="mt-8 p-4 bg-gray-800/30 rounded-lg">
          <h3 className="text-white font-semibold mb-3">Platform Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Total Predictions</p>
              <p className="text-white text-2xl font-bold">
                {predictions.length}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Predictions</p>
              <p className="text-green-400 text-2xl font-bold">
                {predictions.filter((p) => p.status === 'ACTIVE').length}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Volume</p>
              <p className="text-white text-2xl font-bold">
                ₹
                {predictions
                  .reduce((sum, p) => sum + p.totalAmount, 0)
                  .toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Participants</p>
              <p className="text-white text-2xl font-bold">
                {predictions.reduce((sum, p) => sum + p.totalVotes, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
