import { experimental_createTheme } from '../createTheme';
import { dark } from './dark';

export const shadesOfPurple = experimental_createTheme({
  baseTheme: dark,
  variables: {
    colors: {
      background: '#3f3c77',
      primary: '#f8d80d',
      primaryForeground: '#38375f',
      inputForeground: '#a1fdfe',
      shimmer: 'rgba(161,253,254,0.36)',
      shimmerShadow: '1px 1px 2px rgba(0,0,0,0.36)',
    },
  },
});
