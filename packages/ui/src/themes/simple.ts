import { experimental_createTheme } from './createTheme';

export const experimental__simple = experimental_createTheme({
  name: 'simple',
  //@ts-expect-error not public api
  simpleStyles: true,
});
