/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0A0F1E', surface: '#111827', elevated: '#1A2235' },
        border: { DEFAULT: '#1F2937', light: '#374151' },
        primary: { DEFAULT: '#6366F1', hover: '#4F46E5', light: '#818CF8' },
        secondary: { DEFAULT: '#34D399', hover: '#10B981', light: '#6EE7B7' },
        danger: { DEFAULT: '#F43F5E', hover: '#E11D48', light: '#FB7185' },
        warning: { DEFAULT: '#F59E0B', light: '#FCD34D' },
        info: { DEFAULT: '#38BDF8', light: '#7DD3FC' },
        text: { primary: '#F9FAFB', secondary: '#9CA3AF', muted: '#6B7280' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        glass: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        glow: '0 0 20px rgba(99,102,241,0.3)',
        'glow-emerald': '0 0 20px rgba(52,211,153,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(-10px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
      opacity: {
        '6': '0.06',
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
      },
    },
  },
  plugins: [],
};
