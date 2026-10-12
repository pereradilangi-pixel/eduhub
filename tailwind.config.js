/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          900: '#06070f',
          800: '#0a0c18',
          700: '#0f1226',
          600: '#161a36',
          500: '#1e2348',
          400: '#2a3060',
        },
        neon: {
          cyan: '#22d3ee',
          cyanD: '#06b6d4',
          violet: '#a78bfa',
          violetD: '#8b5cf6',
          pink: '#f472b6',
          lime: '#a3e635',
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -2px rgba(34,211,238,0.45)',
        'neon-violet': '0 0 20px -2px rgba(167,139,250,0.45)',
        'neon-soft': '0 0 40px -10px rgba(34,211,238,0.3), 0 0 40px -10px rgba(167,139,250,0.2)',
        'card': '0 4px 30px -8px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px)",
        'neon-gradient': 'linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%)',
        'neon-gradient-2': 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 20px -5px rgba(34,211,238,0.4)' },
          '50%': { boxShadow: '0 0 40px -5px rgba(34,211,238,0.7)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: 0, transform: 'translateX(40px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        bounceSoft: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('light', 'html:not(.dark) &');
    },
  ],
};
