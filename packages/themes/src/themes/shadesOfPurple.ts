import { unstable_createTheme } from '../createTheme';
import { dark } from './dark';

export const shadesOfPurple = unstable_createTheme({
  baseTheme: [dark],
  variables: {
    colorBackground: '#3f3c77',
    colorPrimary: '#f8d80d',
    colorTextOnPrimaryBackground: '#38375f',
    colorInputText: '#a1fdfe',
  },
});
