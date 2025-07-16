import { experimental_createTheme } from '../createTheme';

export const shadcn = experimental_createTheme({
  variables: {
    colorBackground: 'var(--card)',
    colorForeground: 'var(--card-foreground)',
    colorPrimary: 'var(--primary)',
    colorPrimaryForeground: 'var(--primary-foreground)',
    colorMuted: 'var(--muted)',
    colorMutedForeground: 'var(--muted-foreground)',
    colorRing: 'var(--ring)',
    colorInput: 'transparent',
    colorInputForeground: 'var(--card-foreground)',
    colorDanger: 'var(--destructive)',
    colorNeutral: 'var(--foreground)',
  },
});
