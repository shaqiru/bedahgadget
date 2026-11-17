import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Plate: latar gambar still dan header figur, tetap terang di kedua tema karena gambar berlatar putih.
        plate: {
          DEFAULT: '#F7F7F4',
          head: '#E7E5DF',
          line: '#D2D0C9',
          ink: '#14181C',
        },
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
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          contrast: 'rgb(var(--accent-contrast-rgb) / <alpha-value>)',
          link: 'rgb(var(--accent-link-rgb) / <alpha-value>)',
          positive: 'rgb(var(--accent-positive-rgb) / <alpha-value>)',
          danger: 'rgb(var(--accent-danger-rgb) / <alpha-value>)',
          // Teks state aktif kartu.
          ember: 'rgb(var(--accent-ember-rgb) / <alpha-value>)',
          'ember-strong': 'rgb(var(--accent-ember-strong-rgb) / <alpha-value>)',
          // Isian saja; dilarang sebagai warna teks (scripts/check-theme-css.mjs).
          hot: 'rgb(var(--accent-hot-rgb) / <alpha-value>)',
          heat: 'rgb(var(--accent-heat-rgb) / <alpha-value>)',
        },
        'on-heat': 'rgb(var(--text-on-heat-rgb) / <alpha-value>)',
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
        brand: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        heading: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        // Body prosa memakai Literata; UI mewarisi font yang sama.
        sans: ['Literata', 'Georgia', '"Times New Roman"', 'serif'],
        // Font mono sistem: tanpa unduhan, supaya FCP tidak tertahan (spec brand-system).
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', '"Liberation Mono"', 'monospace'],
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
