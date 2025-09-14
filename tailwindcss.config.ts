import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    // colors
    colors: {
      primary: '#2563eb',
      surface: '#1f2937',
      background: '#111827',
      success: '16a34a',
      error: 'dc2626',
    },

    // animations
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'pulse-glow': 'pulseGlow 2s infinite',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0', transform: 'translateY(10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      slideUp: {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },

      pulseGlow: {
        '0%, 100%': { boxShadow: '0 0 0 0 rgba(37,99,235,0.7)' },
        '50%': { boxShadow: '0 0 0 10px rgba(37,99,235,0)' },
      },
    },
  },
  plugins: [],
};

export default config;
