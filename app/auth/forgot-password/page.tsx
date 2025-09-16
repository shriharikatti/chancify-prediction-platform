'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSent(true);
        toast.success('Reset instructions sent to your email!');
      } else {
        toast.error(result.error || 'Failed to send reset email');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-[var(--surface)] p-8 rounded-xl border border-gray-700">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Check Your Email
            </h1>
            <p className="text-gray-300 mb-6">
              If an account exists, we&apos;ve sent password reset instructions
              to your email.
            </p>
            <Link
              href="/auth/login"
              className="text-[var(--primary)] hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-300">
            Enter your email to reset your password
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-[var(--surface)] p-8 rounded-xl border border-gray-700"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              })}
              type="email"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--primary)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-[var(--primary)] hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
