import { experimental_createTheme } from '../createTheme';
import { dark } from './dark';

export const clerk = experimental_createTheme({
  baseTheme: dark,
  elements: darkModeSelector => {
    return {
      button: {
        backgroundColor: 'red',
        [darkModeSelector]: {
          backgroundColor: 'blue',
        },
      },
    };
  },
});
