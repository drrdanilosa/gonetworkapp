import type { Config } from 'tailwindcss'

// Define manualmente as cores do tema Dracula
const draculaColors = {
  'dracula-background': '#282a36',
  'dracula-current-line': '#44475a',
  'dracula-selection': '#44475a',
  'dracula-foreground': '#f8f8f2',
  'dracula-comment': '#6272a4',
  'dracula-cyan': '#8be9fd',
  'dracula-green': '#50fa7b',
  'dracula-orange': '#ffb86c',
  'dracula-pink': '#ff79c6',
  'dracula-purple': '#bd93f9',
  'dracula-red': '#ff5555',
  'dracula-yellow': '#f1fa8c',
}

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'monospace'],
      }, // Integração do tema Dracula
      colors: {
        ...draculaColors,
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        highlight: {
          DEFAULT: 'hsl(var(--highlight))',
          foreground: 'hsl(var(--highlight-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-dracula': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-dracula':
          'pulse-dracula 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-in',
        'fade-out': 'fade-out 0.3s ease-out',
      },
      boxShadow: {
        'dracula-sm': '0 1px 2px 0 rgba(40, 42, 54, 0.05)',
        dracula: '0 4px 14px 0 rgba(189, 147, 249, 0.15)',
        'dracula-md':
          '0 4px 6px -1px rgba(40, 42, 54, 0.1), 0 2px 4px -1px rgba(40, 42, 54, 0.06)',
        'dracula-lg':
          '0 10px 15px -3px rgba(40, 42, 54, 0.1), 0 4px 6px -2px rgba(40, 42, 54, 0.05)',
        'dracula-xl':
          '0 20px 25px -5px rgba(40, 42, 54, 0.1), 0 10px 10px -5px rgba(40, 42, 54, 0.04)',
        'dracula-2xl': '0 25px 50px -12px rgba(40, 42, 54, 0.25)',
        'dracula-inner': 'inset 0 2px 4px 0 rgba(40, 42, 54, 0.06)',
        'dracula-hover': '0 10px 30px 0 rgba(189, 147, 249, 0.4)',
        'dracula-cyan': '0 4px 14px 0 rgba(139, 233, 253, 0.3)',
        'dracula-pink': '0 4px 14px 0 rgba(255, 121, 198, 0.3)',
        'dracula-green': '0 4px 14px 0 rgba(80, 250, 123, 0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
