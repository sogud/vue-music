/** @type {import('tailwindcss').Config} */
const animate = require('tailwindcss-animate')

module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{vue,ts}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        paper: 'rgb(var(--ot-paper) / <alpha-value>)',
        card: 'rgb(var(--ot-card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--ot-ink) / <alpha-value>)',
        popover: 'rgb(var(--ot-card) / <alpha-value>)',
        'popover-foreground': 'rgb(var(--ot-ink) / <alpha-value>)',
        background: 'rgb(var(--ot-paper) / <alpha-value>)',
        foreground: 'rgb(var(--ot-ink) / <alpha-value>)',
        panel: 'rgb(var(--ot-panel) / <alpha-value>)',
        ink: 'rgb(var(--ot-ink) / <alpha-value>)',
        muted: 'rgb(var(--ot-muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--ot-muted) / <alpha-value>)',
        line: 'rgb(var(--ot-line) / <alpha-value>)',
        border: 'rgb(var(--ot-line) / <alpha-value>)',
        input: 'rgb(var(--ot-line) / <alpha-value>)',
        ring: 'rgb(var(--ot-accent) / <alpha-value>)',
        accent: 'rgb(var(--ot-accent) / <alpha-value>)',
        'accent-foreground': 'rgb(var(--ot-ink) / <alpha-value>)',
        primary: 'rgb(var(--ot-accent) / <alpha-value>)',
        'primary-foreground': 'rgb(255 255 255 / <alpha-value>)',
        secondary: 'rgb(var(--ot-soft) / <alpha-value>)',
        'secondary-foreground': 'rgb(var(--ot-ink) / <alpha-value>)',
        soft: 'rgb(var(--ot-soft) / <alpha-value>)',
        danger: 'rgb(var(--ot-danger) / <alpha-value>)',
        destructive: 'rgb(var(--ot-danger) / <alpha-value>)'
      }
    }
  },
  plugins: [animate]
}
