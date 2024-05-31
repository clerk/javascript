import type { Config } from 'tailwindcss';

function generateScale(name: string) {
  const scale = Array.from({ length: 12 }, (_, i) => {
    const id = i + 1;
    return [
      [id, `var(--cl-${name}-${id})`],
      [`a${id}`, `var(--cl-${name}-a${id})`],
    ];
  }).flat();

  return Object.fromEntries(scale);
}

const config = {
  corePlugins: {
    preflight: false,
    backgroundOpacity: false,
  },
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--cl-font-family)'],
      },
      colors: {
        accent: {
          ...generateScale('accent'),
          DEFAULT: 'var(--cl-accent)',
          foreground: 'var(--cl-accent-foreground)',
          surface: 'var(--cl-accent-surface)',
        },
        danger: {
          DEFAULT: 'var(--cl-danger)',
          ...generateScale('danger'),
        },
        success: {
          DEFAULT: 'var(--cl-success)',
          ...generateScale('success'),
        },
        warning: {
          DEFAULT: 'var(--cl-warning)',
          ...generateScale('warning'),
        },
        gray: {
          ...generateScale('gray'),
          DEFAULT: 'var(--cl-gray)',
          foreground: 'var(--cl-gray-foreground)',
          surface: 'var(--cl-gray-surface)',
        },
      },
    },
  },
} satisfies Config;

export default config;
