'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface ResolvePredictionProps {
  predictionId: string;
  question: string;
  onResolved: () => void;
}

export default function ResolvePrediction({
  predictionId,
  question,
  onResolved,
}: ResolvePredictionProps) {
  const [loading, setLoading] = useState(false);

  const handleResolve = async (result: 'YES' | 'NO' | 'CANCELLED') => {
    if (
      !confirm(
        `Resolve this prediction as ${result}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);
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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resolve prediction');
      }

      toast.success(`Prediction resolved as ${result}. Rewards distributed!`);
      onResolved();
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] p-4 rounded-lg border border-gray-700 mb-4">
      <h3 className="text-white font-medium mb-3">{question}</h3>
      <div className="flex space-x-3">
        <button
          onClick={() => handleResolve('YES')}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          Resolve: YES
        </button>
        <button
          onClick={() => handleResolve('NO')}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          Resolve: NO
        </button>
        <button
          onClick={() => handleResolve('CANCELLED')}
          disabled={loading}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          Cancel & Refund
        </button>
      </div>
    </div>
  );
}
