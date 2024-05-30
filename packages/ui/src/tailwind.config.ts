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
      spacing: {
        'space-1': 'calc(0.25rem * var(--cl-scaling-unit))',
        'space-2': 'calc(0.5rem * var(--cl-scaling-unit))',
        'space-3': 'calc(0.75rem * var(--cl-scaling-unit))',
        'space-4': 'calc(1rem * var(--cl-scaling-unit))',
        'space-5': 'calc(1.25rem * var(--cl-scaling-unit))',
        'space-6': 'calc(1.5rem * var(--cl-scaling-unit))',
        'space-7': 'calc(1.75rem * var(--cl-scaling-unit))',
        'space-8': 'calc(2rem * var(--cl-scaling-unit))',
      },
      colors: {
        accent: {
          ...generateScale('accent'),
          contrast: 'var(--cl-accent-contrast)',
          surface: 'var(--cl-accent-surface)',
        },
        gray: {
          ...generateScale('gray'),
          contrast: 'var(--cl-gray-contrast)',
          surface: 'var(--cl-gray-surface)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--cl-color-destructive))',
        },
      },
    },
  },
} satisfies Config;

export default config;
