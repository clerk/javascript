import { createTheme } from '../createTheme';

export const clerk = createTheme(darkModeSelector => ({
  variables: {
    colorBackground: 'red',
    colorNeutral: ['black', 'white'],
    colorPrimary: ['#2F3037', '#ffffff'],
    colorPrimaryForeground: ['white', 'black'],
    colorForeground: ['black', 'white'],
    colorInputForeground: ['black', 'white'],
    colorInput: ['white', '#26262B'],
  },
  elements: {
    providerIcon__apple: { [darkModeSelector]: { filter: 'invert(1)' } },
    providerIcon__github: { [darkModeSelector]: { filter: 'invert(1)' } },
    providerIcon__okx_wallet: { [darkModeSelector]: { filter: 'invert(1)' } },
    activeDeviceIcon: {
      [darkModeSelector]: {
        '--cl-chassis-bottom': '#d2d2d2',
        '--cl-chassis-back': '#e6e6e6',
        '--cl-chassis-screen': '#e6e6e6',
        '--cl-screen': '#111111',
      },
    },
  },
}));
