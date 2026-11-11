/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        azure: {
          50: '#eef6fb', 100: '#d7e9f4', 200: '#b3d4e9', 300: '#82b8d9',
          400: '#4e9bc7', 500: '#2f7fa8', 600: '#0e5c86', 700: '#0c4d70',
          800: '#0a3f5c', 900: '#08344b',
        },
        ink: { DEFAULT: '#0c1116', soft: '#33414e', mute: '#64748b' },
        paper: '#f5f7f9',
        line: '#e4eaf0',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl2: '20px' },
      boxShadow: {
        card: '0 20px 44px -38px rgba(12,30,55,.55)',
        float: '0 24px 50px -30px rgba(12,40,70,.42)',
        hero: '0 30px 60px -34px rgba(6,20,40,.7)',
      },
    },
  },
  plugins: [],
}
