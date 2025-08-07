import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f3efe6',
        foreground: '#2e2e2e',
        primary: {
          DEFAULT: '#2e2e2e',
          dark: '#1a1a1a',
          50: '#f3efe6',
          100: '#e7ddd0',
          200: '#cfbba1',
          300: '#b79972',
          400: '#9f7743',
          500: '#2e2e2e',
          600: '#252525',
          700: '#1c1c1c',
          800: '#131313',
          900: '#0a0a0a',
        },
        secondary: {
          DEFAULT: '#b5cbb7',
          50: '#f3f6f4',
          100: '#e7ede8',
          200: '#cfdbcf',
          300: '#b5cbb7',
          400: '#9dba9e',
          500: '#85a986',
          600: '#6d8a6e',
          700: '#556855',
          800: '#3d463d',
          900: '#252925',
        },
        accent: '#b5cbb7',
        sage: '#b5cbb7',
        cream: '#f3efe6',
        dark: '#2e2e2e',
        // Keep some semantic colors mapped to our palette
        success: '#b5cbb7',
        warning: '#b5cbb7',
        error: '#2e2e2e',
        info: '#b5cbb7',
        // Gray scale using our colors
        gray: {
          50: '#f3efe6',
          100: '#e7ddd0',
          200: '#d0c4b3',
          300: '#b8aa96',
          400: '#a0907a',
          500: '#88765d',
          600: '#6d5d4a',
          700: '#524436',
          800: '#372b23',
          900: '#2e2e2e',
        }
      },
      fontFamily: {
        sans: ['var(--font-rubik)', 'system-ui', '-apple-system', 'sans-serif'],
        rubik: ['var(--font-rubik)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-5px) rotate(1deg)' },
          '50%': { transform: 'translateY(-10px) rotate(0deg)' },
          '75%': { transform: 'translateY(-5px) rotate(-1deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(181, 203, 183, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(181, 203, 183, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
} satisfies Config
