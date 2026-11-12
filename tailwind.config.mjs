import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B132B',
          900: '#070C1B',
          800: '#0B132B',
          700: '#15224D',
          600: '#1F326E',
        },
        ocean: {
          DEFAULT: '#0169E9',
          light: '#3388EE',
          dark: '#0152B7',
        },
        clover: {
          DEFAULT: '#25D366',
          light: '#4AE182',
          dark: '#1CA850',
        },
        chalk: {
          DEFAULT: '#F4F4F4',
          50: '#FFFFFF',
          100: '#F4F4F4',
          200: '#E8E8E8',
          300: '#D5D5D5',
        },
        brandgray: '#7C869B',
        brandred: '#E5484D',
        page: 'rgb(var(--bg-page-rgb) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface-rgb) / <alpha-value>)',
        elevated: 'rgb(var(--bg-elevated-rgb) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--text-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
          muted: 'rgb(var(--text-muted-rgb) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--border-hairline-rgb) / <alpha-value>)',
          strong: 'rgb(var(--border-strong-rgb) / <alpha-value>)',
        },
        accent: {
          link: 'rgb(var(--accent-link-rgb) / <alpha-value>)',
          positive: 'rgb(var(--accent-positive-rgb) / <alpha-value>)',
          danger: 'rgb(var(--accent-danger-rgb) / <alpha-value>)',
        },
        action: {
          DEFAULT: 'rgb(var(--bg-action-rgb) / <alpha-value>)',
          hover: 'rgb(var(--bg-action-hover-rgb) / <alpha-value>)',
        },
        'on-action': {
          DEFAULT: 'rgb(var(--text-on-action-rgb) / <alpha-value>)',
          hover: 'rgb(var(--text-on-action-hover-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        brand: ['"Archivo Black"', 'system-ui', 'sans-serif'],
        heading: ['"Archivo Black"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
          },
        },
      },
    },
  },
  plugins: [typography],
};
