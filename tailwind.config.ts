import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

// Brand tokens copied from the marketing site (the landing page (crewzodesk/index.html)). Keep in sync.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#15803d',
        'primary-dark': '#166534',
        accent: '#16A34A',
        'accent-light': '#22C55E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundColor: {
        base: '#F9FAFB',
      },
    },
  },
  plugins: [typography],
}
export default config
