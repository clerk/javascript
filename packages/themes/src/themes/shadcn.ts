import { experimental_createTheme } from '../createTheme';

export const shadcn = experimental_createTheme({
  cssLayerName: 'components',
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
    fontSize: {
      sm: 'var(--text-sm)',
      md: 'var(--text-sm)',
      lg: 'var(--text-base)',
      xl: 'var(--text-base)',
    },
    fontWeight: {
      medium: 'var(--font-weight-medium)',
      semibold: 'var(--font-weight-semibold)',
      bold: 'var(--font-weight-semibold)',
    },
  },
  elements: {
    input: 'bg-transparent dark:bg-input/30',
    cardBox: 'shadow-sm border',
  },
});
