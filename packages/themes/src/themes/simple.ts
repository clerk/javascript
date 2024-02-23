import { experimental_createTheme } from '../createTheme';

export const __unstable_simple = experimental_createTheme({
  //@ts-expect-error not public api
  simpleStyles: true,
});
