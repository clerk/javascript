import { experimental_createTheme } from '../createTheme';

export const shadcn = experimental_createTheme({
  variables: {
    colorBackground: 'var(--card)',
    colorDanger: 'var(--destructive)',
    colorForeground: 'var(--card-foreground)',
    colorInput: 'var(--input)',
    colorInputForeground: 'var(--card-foreground)',
    colorModalBackdrop: 'var(--color-black)',
    colorMuted: 'var(--muted)',
    colorMutedForeground: 'var(--muted-foreground)',
    colorNeutral: 'var(--foreground)',
    colorPrimary: 'var(--primary)',
    colorPrimaryForeground: 'var(--primary-foreground)',
    colorRing: 'var(--ring)',
  },
  elements: {
    input: 'bg-transparent dark:bg-input/30',
  },
});
