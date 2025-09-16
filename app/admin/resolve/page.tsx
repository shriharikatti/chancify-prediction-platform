'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

interface PredictionToResolve {
  id: string;
  question: string;
  description?: string;
  category: string;
  endTime: string;
  status: string;
  totalVotes: number;
  totalAmount: number;
  yesVotes: number;
  noVotes: number;
  yesPercentage: number;
  noPercentage: number;
}

export default function AdminResolvePage() {
  const [predictions, setPredictions] = useState<PredictionToResolve[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const router = useRouter();

  const fetchResolvablePredictions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/resolvable-predictions', {
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
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchResolvablePredictions();
  }, [router]);

  const handleResolve = async (
    predictionId: string,
    result: 'YES' | 'NO' | 'CANCELLED'
  ) => {
    if (
      !confirm(
        `Resolve this prediction as ${result}? This will distribute rewards and cannot be undone.`
      )
    ) {
      return;
    }

    setResolving(predictionId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/predictions/${predictionId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ result }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve prediction');
      }

      toast.success(
        `Prediction resolved as ${result}! Rewards distributed to ${
          data.winnersCount || 0
        } winners.`
      );

      // Remove resolved prediction from list
      setPredictions((prev) => prev.filter((p) => p.id !== predictionId));
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve prediction');
    } finally {
      setResolving(null);
    }
  };

  const isExpired = (endTime: string) => new Date(endTime) < new Date();

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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-gray-700 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Resolve Predictions
            </h1>
            <p className="text-gray-300">
              Declare results and distribute rewards to winners
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
        {predictions.length === 0 ? (
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-400">
              No predictions need resolution at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="bg-[var(--surface)] rounded-xl p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-[var(--primary)]/20 text-[var(--primary)] px-3 py-1 rounded-full text-sm font-medium">
                        {prediction.category}
                      </span>
                      {isExpired(prediction.endTime) ? (
                        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                          ⏰ EXPIRED
                        </span>
                      ) : (
                        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                          ⏳ ACTIVE
                        </span>
                      )}
                    </div>
                    <h3 className="text-white text-xl font-semibold mb-2">
                      {prediction.question}
                    </h3>
                    {prediction.description && (
                      <p className="text-gray-300 mb-3">
                        {prediction.description}
                      </p>
                    )}

                    {/* Voting Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-700/30 p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">Total Votes</p>
                        <p className="text-white text-2xl font-bold">
                          {prediction.totalVotes}
                        </p>
                      </div>
                      <div className="bg-gray-700/30 p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">Total Pool</p>
                        <p className="text-white text-2xl font-bold">
                          ₹{prediction.totalAmount.toFixed(0)}
                        </p>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-lg text-center">
                        <p className="text-green-400 text-sm">YES Votes</p>
                        <p className="text-white text-2xl font-bold">
                          {prediction.yesVotes} ({prediction.yesPercentage}%)
                        </p>
                      </div>
                      <div className="bg-red-500/20 p-3 rounded-lg text-center">
                        <p className="text-red-400 text-sm">NO Votes</p>
                        <p className="text-white text-2xl font-bold">
                          {prediction.noVotes} ({prediction.noPercentage}%)
                        </p>
                      </div>
                    </div>

                    {/* Visual Vote Distribution */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-300 mb-2">
                        <span>YES {prediction.yesPercentage}%</span>
                        <span>NO {prediction.noPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${prediction.yesPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolution Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleResolve(prediction.id, 'YES')}
                    disabled={resolving === prediction.id}
                    className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resolving === prediction.id
                      ? 'Resolving...'
                      : '✓ Resolve as YES'}
                  </button>
                  <button
                    onClick={() => handleResolve(prediction.id, 'NO')}
                    disabled={resolving === prediction.id}
                    className="flex-1 bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resolving === prediction.id
                      ? 'Resolving...'
                      : '✗ Resolve as NO'}
                  </button>
                  <button
                    onClick={() => handleResolve(prediction.id, 'CANCELLED')}
                    disabled={resolving === prediction.id}
                    className="flex-1 bg-gray-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resolving === prediction.id
                      ? 'Resolving...'
                      : '↩ Cancel & Refund'}
                  </button>
                </div>

                <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <p className="text-yellow-200 text-sm text-center">
                    ⚠️ <strong>Important:</strong> Resolution cannot be undone.
                    Winners will receive automatic payouts.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
