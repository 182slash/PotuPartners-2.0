/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        'gold-light': '#D4AF37',
        'gold':       '#C6A75E',
        'gold-dark':  '#A8893E',
        'gold-muted': '#8A6E2E',
        'text-primary': '#D9D9D9',
        'text-secondary': '#9A9A9A',
        'text-muted':    '#5A5A5A',
        'surface':       '#0D0D0D',
        'surface-2':     '#141414',
        'surface-3':     '#1C1C1C',
        'divider':       '#2A2A2A',
        'divider-light': '#333333',
      },
      fontFamily: {
        serif:    ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:     ['DM Sans', 'system-ui', 'sans-serif'],
        display:  ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        'display-xl': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.75rem, 3vw, 3rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
      },
      animation: {
        'gold-pulse':    'goldPulse 2.5s ease-in-out infinite',
        'line-draw':     'lineDraw 1.2s ease-out forwards',
        'fade-up':       'fadeUp 0.7s ease-out forwards',
        'fade-in':       'fadeIn 0.5s ease-out forwards',
        'letter-in':     'letterIn 0.6s ease-out forwards',
        'slide-up':      'slideUp 0.4s ease-out forwards',
        'shimmer':       'shimmer 2s linear infinite',
        'float':         'float 6s ease-in-out infinite',
        'spin-slow':     'spin 8s linear infinite',
        'ping-slow':     'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bell-ring':     'bellRing 0.6s ease-in-out',
      },
      keyframes: {
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(198, 167, 94, 0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(198, 167, 94, 0)' },
        },
        lineDraw: {
          '0%':   { width: '0%', opacity: '0' },
          '100%': { width: '100%', opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        letterIn: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        bellRing: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '15%':      { transform: 'rotate(15deg)' },
          '30%':      { transform: 'rotate(-12deg)' },
          '45%':      { transform: 'rotate(10deg)' },
          '60%':      { transform: 'rotate(-8deg)' },
          '75%':      { transform: 'rotate(5deg)' },
          '90%':      { transform: 'rotate(-3deg)' },
        },
      },
      backgroundImage: {
        'gold-gradient':        'linear-gradient(135deg, #C6A75E 0%, #D4AF37 50%, #C6A75E 100%)',
        'gold-shimmer':         'linear-gradient(90deg, #C6A75E 0%, #D4AF37 30%, #F0D060 50%, #D4AF37 70%, #C6A75E 100%)',
        'surface-gradient':     'linear-gradient(180deg, #000000 0%, #0D0D0D 100%)',
        'hero-gradient':        'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(198,167,94,0.07) 0%, transparent 70%)',
        'section-gradient':     'linear-gradient(180deg, #0D0D0D 0%, #141414 100%)',
      },
      boxShadow: {
        'gold':        '0 0 20px rgba(198, 167, 94, 0.3)',
        'gold-lg':     '0 0 40px rgba(198, 167, 94, 0.2)',
        'gold-inner':  'inset 0 0 20px rgba(198, 167, 94, 0.1)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.6)',
        'card-hover':  '0 8px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(198, 167, 94, 0.15)',
      },
      borderColor: {
        'gold':        '#C6A75E',
        'gold-dim':    'rgba(198, 167, 94, 0.3)',
        'gold-faint':  'rgba(198, 167, 94, 0.1)',
        'surface':     '#2A2A2A',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'reveal': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
};