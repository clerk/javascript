import { experimental_createTheme } from '../createTheme';

export const clerk = experimental_createTheme({
  variables: {
    colorBackground: ['#ffffff', '#212126'],
    colorNeutral: ['#000000', '#ffffff'],
    colorPrimary: ['#000000', '#ffffff'],
    colorPrimaryForeground: ['#ffffff', '#000000'],
    colorForeground: ['#000000', '#ffffff'],
    colorInputForeground: ['#000000', '#ffffff'],
    colorInput: ['#ffffff', '#26262B'],
    colorModalBackdrop: ['#000000', '#000000'],
  },
  elements: darkModeSelector => {
    return {
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
    };
  },
});
