/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--ot-paper) / <alpha-value>)',
        card: 'rgb(var(--ot-card) / <alpha-value>)',
        ink: 'rgb(var(--ot-ink) / <alpha-value>)',
        muted: 'rgb(var(--ot-muted) / <alpha-value>)',
        line: 'rgb(var(--ot-line) / <alpha-value>)',
        accent: 'rgb(var(--ot-accent) / <alpha-value>)',
        danger: 'rgb(var(--ot-danger) / <alpha-value>)'
      }
    }
  },
  plugins: []
}
