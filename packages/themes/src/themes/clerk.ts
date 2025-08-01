import { experimental_createTheme } from '../createTheme';

export const clerk = experimental_createTheme({
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
