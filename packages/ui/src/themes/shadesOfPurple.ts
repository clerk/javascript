import { experimental_createTheme } from './createTheme';
import { dark } from './dark';

export const shadesOfPurple = experimental_createTheme({
  name: 'shadesOfPurple',
  baseTheme: dark,
  variables: {
    colorBackground: '#3f3c77',
    colorPrimary: '#f8d80d',
    colorPrimaryForeground: '#38375f',
    colorInputForeground: '#a1fdfe',
    colorShimmer: 'rgba(161,253,254,0.36)',
  },
});
