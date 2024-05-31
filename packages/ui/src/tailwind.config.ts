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
      backgroundColor: {
        button: {
          primary: 'var(--cl-button-background-primary, var(--cl-accent-9))',
          'primary-hover': 'var(--cl-button-background-primary-hover, var(--cl-accent-10))',
        },
      },
      borderColor: {
        button: {
          primary: 'var(--cl-button-border-primary, var(--cl-accent-9))',
        },
      },
      textColor: {
        button: {
          primary: 'var(--cl-button-color-primary, var(--cl-accent-contrast))',
        },
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
