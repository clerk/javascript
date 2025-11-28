import { experimental_createTheme } from './createTheme';

export const shadcn = experimental_createTheme({
  name: 'shadcn',
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
    fontWeight: {
      normal: 'var(--font-weight-normal)',
      medium: 'var(--font-weight-medium)',
      semibold: 'var(--font-weight-semibold)',
      bold: 'var(--font-weight-semibold)',
    },
  },
  elements: {
    input: 'bg-transparent dark:bg-input/30',
    cardBox: 'shadow-sm border',
    popoverBox: 'shadow-sm border',
    button: {
      '&[data-variant="solid"]::after': {
        display: 'none',
      },
    },
    providerIcon__apple: 'dark:invert',
    providerIcon__github: 'dark:invert',
    providerIcon__okx_wallet: 'dark:invert',
  },
});
