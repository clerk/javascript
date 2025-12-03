import { __experimental_createTheme } from './createTheme';

export const __experimental_simple = __experimental_createTheme({
  name: 'simple',
  //@ts-expect-error not public api
  simpleStyles: true,
});
