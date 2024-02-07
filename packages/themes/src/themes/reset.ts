import { experimental_createTheme } from '../createTheme';

export const reset = experimental_createTheme({
  //@ts-expect-error not public api
  simpleStyles: true,
});
