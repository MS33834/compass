import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 深海航海仪器色板
        abyss: {
          DEFAULT: '#0B1426',
          50: '#1a2740',
          100: '#15203a',
          200: '#101a30',
          300: '#0e1728',
          400: '#0c1522',
          500: '#0B1426',
          600: '#080f1d',
          700: '#060b15',
          800: '#040710',
          900: '#020509',
        },
        ivory: {
          DEFAULT: '#F5F1E8',
          50: '#fdfbf6',
          100: '#F5F1E8',
          200: '#ebe5d4',
          300: '#ddd4bd',
          400: '#ccc0a3',
        },
        brass: {
          DEFAULT: '#C9A227',
          light: '#e0bc3e',
          dark: '#a3851c',
        },
        tide: {
          DEFAULT: '#4A7C82',
          light: '#6a9ca2',
          dark: '#356066',
        },
        coral: {
          DEFAULT: '#D97757',
          light: '#e89176',
          dark: '#b85d3d',
        },
        starlight: {
          DEFAULT: '#A8B4C4',
          light: '#c4cdd9',
          dark: '#8b97a8',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
