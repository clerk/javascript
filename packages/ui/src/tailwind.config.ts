import type { Config } from 'tailwindcss';

function generateColorScale(name: string) {
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
        'space-1': 'calc(0.25rem * var(--cl-space-scaling-unit))', // 4px
        'space-1.5': 'calc(0.375rem * var(--cl-space-scaling-unit))', // 6px
        'space-2': 'calc(0.5rem * var(--cl-space-scaling-unit))', // 8px
        'space-3': 'calc(0.75rem * var(--cl-space-scaling-unit))', // 12px
        'space-4': 'calc(1rem * var(--cl-space-scaling-unit))', // 16px
        'space-5': 'calc(1.25rem * var(--cl-space-scaling-unit))', // 20px
        'space-6': 'calc(1.5rem * var(--cl-space-scaling-unit))', // 24px
        'space-7': 'calc(1.75rem * var(--cl-space-scaling-unit))', // 28px
        'space-8': 'calc(2rem * var(--cl-space-scaling-unit))', // 32px
      },
      colors: {
        accent: {
          ...generateColorScale('accent'),
          contrast: 'var(--cl-accent-contrast)',
          surface: 'var(--cl-accent-surface)',
        },
        gray: {
          ...generateColorScale('gray'),
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
