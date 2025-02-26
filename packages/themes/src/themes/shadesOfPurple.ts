import { experimental_createTheme } from '../createTheme';
import { dark } from './dark';

export const shadesOfPurple = experimental_createTheme({
  baseTheme: dark,
  variables: {
    colorBackground: '#3f3c77',
    colorPrimary: '#f8d80d',
    colorTextOnPrimaryBackground: '#38375f',
    colorInputText: '#a1fdfe',
    colorShimmer: 'rgba(161,253,254,0.36)',
  },
});
