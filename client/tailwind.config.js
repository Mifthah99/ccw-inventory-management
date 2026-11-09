/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        page: '#f8fafc',
        accent: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          tint: '#eef2ff',
        },
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.06)',
        pop: '0 10px 30px rgb(15 23 42 / 0.12)',
      },
    },
  },
  plugins: [],
}
