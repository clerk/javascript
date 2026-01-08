import { createTheme } from './createTheme';

export const lightDark = createTheme({
  name: 'lightDark',
  variables: {
    colorBackground: 'light-dark(#ffffff, #212126)',
    colorNeutral: 'light-dark(#000000, #ffffff)',
    colorPrimary: 'light-dark(#2F3037, #ffffff)',
    colorPrimaryForeground: 'light-dark(white, black)',
    colorForeground: 'light-dark(#212126, white)',
    colorInputForeground: 'light-dark(#131316, white)',
    colorInput: 'light-dark(white, #26262B)',
  },
  elements: {
    activeDeviceIcon: {
      '--cl-chassis-bottom': 'light-dark(#444444,   #d2d2d2)',
      '--cl-chassis-back': 'light-dark(#343434, #e6e6e6)',
      '--cl-chassis-screen': 'light-dark(#575757, #e6e6e6)',
      '--cl-screen': 'light-dark(#000000, #111111)',
    },
  },
});
