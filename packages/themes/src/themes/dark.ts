import { unstable_createTheme } from '../createTheme';

export const dark = unstable_createTheme({
  variables: {
    colorBackground: '#19191A',
    colorInputBackground: '#19191A',
    colorAlphaShade: 'white',
    colorText: 'white',
    colorInputText: 'white',
  },
  elements: () => {
    return {
      socialButtonsLogo__apple: { filter: 'invert(1)' },
      socialButtonsLogo__github: { filter: 'invert(1)' },
      activeDeviceIcon: {
        '--cl-chassis-bottom': '#d2d2d2',
        '--cl-chassis-back': '#e6e6e6',
        '--cl-chassis-screen': '#e6e6e6',
        '--cl-screen': '#111111',
      },
    };
  },
});
