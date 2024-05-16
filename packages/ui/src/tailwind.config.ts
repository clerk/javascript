import type { Config } from 'tailwindcss';

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
        button: ['var(--cl-font-family-button)'],
      },
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--cl-color-primary))',
          foreground: 'hsl(var(--cl-color-primary-foreground))',
        },
        neutral: 'hsl(var(--cl-color-neutral))',
        background: 'hsl(var(--cl-color-background))',
        foreground: 'hsl(var(--cl-color-foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--cl-color-destructive))',
        },
        card: {
          background: 'hsl(var(--cl-color-card-background))',
          foreground: 'hsl(var(--cl-color-card-foreground))',
        },
        button: {
          background: 'hsl(var(--cl-color-button-background))',
          foreground: 'hsl(var(--cl-color-button-foreground))',
        },
        input: {
          background: 'hsl(var(--cl-color-input-background))',
          foreground: 'hsl(var(--cl-color-input-foreground))',
        },
      },
    },
  },
} satisfies Config;

export default config;
