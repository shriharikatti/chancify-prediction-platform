import HeroTemplate from '@/components/templates/HeroTemplate';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">ChanciFy</span>
          </div>
          <div className="flex space-x-5 items-center">
            <Link
              href="/auth/login"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroTemplate />
    </div>
  );
}
