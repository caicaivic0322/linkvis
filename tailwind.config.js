/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './App.tsx',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        app: 'var(--bg-app)',
        panel: 'var(--bg-panel)',
        'panel-border': 'var(--border)',
        input: 'var(--bg-input)',
        main: 'var(--text-main)',
        muted: 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-text': 'var(--accent-text)',
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
      }
    },
  },
  plugins: [],
}