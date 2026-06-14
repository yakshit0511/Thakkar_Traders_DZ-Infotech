/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-card': 'var(--color-bg-card)',
        'bg-light': 'var(--color-bg-light)',
        'bg-light-alt': 'var(--color-bg-light-alt)',
        'accent-gold': 'var(--color-accent-gold)',
        'accent-copper': 'var(--color-accent-copper)',
        'accent-gold-muted': 'var(--color-accent-gold-muted)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-dark': 'var(--color-text-dark)',
        'text-dark-secondary': 'var(--color-text-dark-secondary)',
        'border-dark': 'var(--color-border-dark)',
        'border-light': 'var(--color-border-light)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        neutral: 'var(--color-neutral)',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 8vw, 8rem)', { lineHeight: '1.1' }],
        'display-lg': ['clamp(2.5rem, 5vw, 5rem)', { lineHeight: '1.15' }],
        'display-md': ['clamp(1.8rem, 3vw, 3rem)', { lineHeight: '1.2' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body-base': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        label: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.15em' }],
      },
    },
  },
  plugins: [],
};
