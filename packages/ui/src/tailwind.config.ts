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
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--cl-font-family)'],
      },
      fontSize: ({ theme }) => ({
        DEFAULT: ['var(--cl-font-size)', theme('lineHeight.DEFAULT')],
        base: ['var(--cl-font-size)', theme('lineHeight.base')],
        xs: ['calc(var(--cl-font-size) * 0.8)', theme('lineHeight.xs')],
        sm: ['calc(var(--cl-font-size) * 0.9)', theme('lineHeight.sm')],
        md: ['var(--cl-font-size)', theme('lineHeight.md')],
        lg: ['calc(var(--cl-font-size) * 1.3)', theme('lineHeight.lg')],
        xl: ['calc(var(--cl-font-size) * 1.85)', theme('lineHeight.xl')],
        'icon-sm': ['calc(var(--cl-font-size) * 1.23)', theme('lineHeight[icon-sm]')],
      }),
      borderRadius: {
        DEFAULT: 'var(--cl-radius)',
        sm: 'calc(var(--cl-radius) * 0.66)',
        md: 'var(--cl-radius)',
        lg: 'calc(var(--cl-radius) * 1.33)',
        xl: 'calc(var(--cl-radius) * 2)',
      },
      lineHeight: {
        DEFAULT: '1.38462',
        base: '1.38462',
        xs: '1.38462',
        sm: '1.38462',
        md: '1.38462',
        lg: '1.38462',
        xl: '1.38462',
        'icon-sm': '0',
        // normal: 'normal',
        // extraSmall: '1.33333',
        // small: '1.38462',
        // medium: '1.41176',
        // large: '1.45455',
      },
      spacing: {
        ...generateSpaceScale(),
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
      ringColor: {
        // note: it's not possible to use `DEFAULT` with `ringColor`
        //       therefore we'll need to use `ring-default`
        default: 'var(--cl-accent-a9)',
      },
      animation: {
        spin: 'cl-spin linear infinite',
        blink: 'cl-blink 1s step-end 0.2s infinite',
      },
    },
  },
} satisfies Config;

export default config;
