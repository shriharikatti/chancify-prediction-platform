import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        background: '#111827',
        surface: '#1f2937',
        success: '#16a34a',
        error: '#dc2626',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37,99,235,0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(37,99,235,0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
