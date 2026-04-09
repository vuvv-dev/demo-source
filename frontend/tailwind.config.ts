import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0071e3',
          hover: '#0077ed',
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#0071e3',
          700: '#0056b3',
        },
        dark: {
          DEFAULT: '#1d1d1f',
          secondary: '#6e6e73',
          tertiary: '#86868b',
          bg: '#f5f5f7',
        },
        success: '#34c759',
        warning: '#ff9f0a',
        error: '#ff3b30',
        // Apple design system aliases (used in admin UI components)
        apple: {
          blue: '#0071e3',
          'blue-hover': '#0077ed',
          black: '#1d1d1f',
          red: '#ff3b30',
          green: '#34c759',
          gray: '#f5f5f7',
          'text-secondary': '#86868b',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', "'SF Pro Display'", "'SF Pro Text'", "'Helvetica Neue'", 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 30px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
        'dropdown': '0 4px 20px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}
export default config
