import { experimental_createTheme } from '../createTheme';

export const dark = experimental_createTheme({
  variables: {
    colors: {
      background: '#212126',
      alphaShade: 'white',
      primary: '#ffffff',
      primaryForeground: 'black',
      secondary: '#26262B',
      secondaryForeground: '#D9D9DE',
      text: 'white',
      input: '#26262B',
      inputForeground: 'white',
      shimmer: 'rgba(255,255,255,0.36)',
      shimmerShadow: '1px 1px 2px rgba(0,0,0,0.36)',
    },
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
