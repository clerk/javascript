import { createTheme } from './createTheme';

export const dark = createTheme({
  name: 'dark',
  variables: {
    colorBackground: '#212126',
    colorNeutral: 'white',
    colorPrimary: '#ffffff',
    colorPrimaryForeground: 'black',
    colorForeground: 'white',
    colorInputForeground: 'white',
    colorInput: '#26262B',
  },
  elements: {
    activeDeviceIcon: {
      '--cl-chassis-bottom': '#d2d2d2',
      '--cl-chassis-back': '#e6e6e6',
      '--cl-chassis-screen': '#e6e6e6',
      '--cl-screen': '#111111',
    },
  },
});
