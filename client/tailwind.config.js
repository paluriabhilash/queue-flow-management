/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36a9f8',
          500: '#0c8ce9',
          600: '#026fc7',
          700: '#0358a1',
          800: '#074b83',
          900: '#0c3f6e',
          950: '#061d33',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          800: '#1e293b',
          900: '#0f172a',
          950: '#080d1a',
        },
        status: {
          waiting: {
            bg: '#064e3b',
            text: '#34d399',
            border: '#059669',
          },
          called: {
            bg: '#78350f',
            text: '#fbbf24',
            border: '#d97706',
          },
          serving: {
            bg: '#312e81',
            text: '#818cf8',
            border: '#4f46e5',
          },
          completed: {
            bg: '#1e293b',
            text: '#94a3b8',
            border: '#475569',
          },
          cancelled: {
            bg: '#881337',
            text: '#fb7185',
            border: '#e11d48',
          },
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
