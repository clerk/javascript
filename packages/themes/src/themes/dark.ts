import { experimental_createTheme } from '../createTheme';

export const dark = experimental_createTheme({
  variables: {
    colorBackground: '#212126',
    colorNeutral: 'hsla(0, 0%, 100%, 0.53)',
    colorPrimary: '#ffffff',
    colorTextOnPrimaryBackground: 'black',
    colorText: 'white',
    colorInputBackground: '#26262B',
    colorInputText: 'white',
    colorShimmer: 'rgba(255,255,255,0.36)',
  },
  elements: {
    providerIcon__apple: { filter: 'invert(1)' },
    providerIcon__github: { filter: 'invert(1)' },
    activeDeviceIcon: {
      '--cl-chassis-bottom': '#d2d2d2',
      '--cl-chassis-back': '#e6e6e6',
      '--cl-chassis-screen': '#e6e6e6',
      '--cl-screen': '#111111',
    },
  },
});
