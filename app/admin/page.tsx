'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';

const schema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  description: z.string().optional(),
  category: z.enum([
    'SPORTS',
    'POLITICS',
    'ENTERTAINMENT',
    'TECHNOLOGY',
    'FINANCE',
  ]),
  endTime: z.string(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function AdminPanel() {
  const router = useRouter();

  // Client-side auth guard
  const [authLoading, setAuthLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.role || user.role === 'USER') {
          router.push('/dashboard');
          return;
        }
        setAuthorized(true);
      } catch (error) {
        router.push('/dashboard');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          imageUrl: data.imageUrl || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create prediction');
      }

      toast.success('Prediction created successfully!');
      reset();

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create prediction');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <p className="text-white">Checking permissions...</p>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-gray-700 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-[var(--surface)] p-8 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6">
            Create New Prediction
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prediction Question
              </label>
              <input
                {...register('question')}
                type="text"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder="Will India win the Cricket World Cup 2024?"
              />
              {errors.question && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.question.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder="Additional context or details about this prediction..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              >
                <option value="SPORTS">🏏 Sports</option>
                <option value="POLITICS">🏛️ Politics</option>
                <option value="ENTERTAINMENT">🎬 Entertainment</option>
                <option value="TECHNOLOGY">💻 Technology</option>
                <option value="FINANCE">💰 Finance</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Time
              </label>
              <input
                {...register('endTime')}
                type="datetime-local"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.endTime.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image URL (Optional)
              </label>
              <input
                {...register('imageUrl')}
                type="url"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              {errors.imageUrl && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.imageUrl.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Prediction...' : 'Create Prediction'}
            </button>
          </form>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
