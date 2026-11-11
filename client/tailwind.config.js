/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NextOpp Brand Palette
        cream: {
          50:  '#FEFCF8',
          100: '#FAF7F0',
          200: '#F5EFE0',
          300: '#EDE3CC',
          DEFAULT: '#F5EFE0',
        },
        charcoal: {
          50:  '#F5F5F5',
          100: '#E8E8E8',
          200: '#C8C8C8',
          300: '#A0A0A0',
          400: '#787878',
          500: '#545454',
          600: '#383838',
          700: '#282828',
          800: '#1A1A1A',
          900: '#111111',
          DEFAULT: '#1A1A1A',
        },
        amber: {
          50:  '#FFF8F0',
          100: '#FEECD8',
          200: '#FCDBB0',
          300: '#F9C278',
          400: '#F5A23C',
          500: '#E08020',
          600: '#C86A10',
          700: '#A85508',
          800: '#884204',
          900: '#6C3302',
          DEFAULT: '#C86A10',
        },
        rust: {
          50:  '#FDF3EE',
          100: '#FAE3D8',
          200: '#F4C4A8',
          300: '#ECA078',
          400: '#E07A4C',
          500: '#C45C2E',
          600: '#A34422',
          700: '#833218',
          800: '#642210',
          900: '#4A1508',
          DEFAULT: '#C45C2E',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        display: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        88: '22rem',
        128: '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'inner-sm': 'inset 0 1px 2px rgba(0,0,0,0.06)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'modal': '0 20px 60px rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.4) 50%, transparent 75%)',
      },
    },
  },
  plugins: [],
}
