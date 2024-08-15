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

const SPACE = [
  [1, '0.25'],
  [1.5, '0.375'],
  [2, '0.5'],
  [3, '0.75'],
  [4, '1'],
  [5, '1.25'],
  [6, '1.5'],
  [7, '1.75'],
  [8, '2'],
] as const;

function generateSpaceScale() {
  return Object.fromEntries(
    SPACE.map(([id, value]) => {
      return [`space-${id}`, `calc(${value} * var(--cl-spacing-unit, 1rem))`];
    }),
  );
}

const config = {
  corePlugins: {
    preflight: false,
    backgroundOpacity: false,
  },
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  future: {
    respectDefaultRingColorOpacity: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--cl-font-family)'],
      },
      fontSize: {
        DEFAULT: ['var(--cl-font-size)', '1.38462'],
        base: ['var(--cl-font-size)', '1.38462'],
        xs: ['calc(var(--cl-font-size) * 0.8)', '1.38462'],
        sm: ['calc(var(--cl-font-size) * 0.9)', '1.38462'],
        md: ['var(--cl-font-size)', '1.38462'],
        lg: ['calc(var(--cl-font-size) * 1.3)', '1.38462'],
        xl: ['calc(var(--cl-font-size) * 1.85)', '1.38462'],
        'icon-sm': ['calc(var(--cl-font-size) * 1.23)', '0'],
      },
      borderRadius: {
        DEFAULT: 'var(--cl-radius)',
        sm: 'calc(var(--cl-radius) * 0.66)',
        md: 'var(--cl-radius)',
        lg: 'calc(var(--cl-radius) * 1.33)',
        xl: 'calc(var(--cl-radius) * 2)',
      },
      lineHeight: {
        normal: 'normal',
        extraSmall: '1.33333',
        small: '1.38462',
        medium: '1.41176',
        large: '1.45455',
      },
      spacing: {
        ...generateSpaceScale(),
      },
      zIndex: {
        1: '1',
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
        danger: {
          DEFAULT: 'hsl(var(--cl-color-danger))',
        },
        success: {
          DEFAULT: 'hsl(var(--cl-color-success))',
        },
        warning: {
          DEFAULT: 'hsl(var(--cl-color-warning))',
        },
      },
      ringWidth: {
        DEFAULT: '0.1875rem',
      },
      ringColor: {
        DEFAULT: 'var(--cl-gray-a7)',
        light: 'var(--cl-gray-a4)',
        'light-opaque': 'var(--cl-gray-4)',
      },
      animation: {
        spin: 'cl-spin linear infinite',
        blink: 'cl-blink 1s step-end 0.2s infinite',
      },
    },
  },
} satisfies Config;

export default config;
