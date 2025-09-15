import React from 'react';

export default function HeroTemplate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 ">
      {/* app Icon   */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-[var(--primary)] rounded-2xl flex items-center justify-center shadow-lg ">
          {/* chart icon  */}
          <svg
            className="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
          </svg>
        </div>
      </div>

      {/* Main heading  */}
      <h1 className="text-5xl font-bold text-white text-center mb-6 animate-text-glow ">
        Predict the Future
      </h1>

      {/* Description */}
      <p className="text-xl text-gray-300 text-center mb-12 max-w-xl">
        Join thousands making predictions on sports, politics, and entertainment
      </p>

      {/* Features list */}
      <div className="flex space-x-8 text-white text-lg">
        <div className="flex items-center space-x-2 hover:text-[var(--primary)] cursor-pointer transition-colors duration-300">
          <span>⚡</span>
          <span>Live Results</span>
        </div>
        <div className="flex items-center space-x-2 hover:text-[var(--primary)] cursor-pointer transition-colors durartion-300">
          <span>👥</span>
          <span>Community</span>
        </div>
        <div className="flex items-center space-x-2 hover:text-[var(--primary)] cursor-pointer transition-colors duration-300">
          <span>📊</span>
          <span>Real Odds</span>
        </div>
      </div>
    </div>
  );
}
