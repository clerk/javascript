import { createTheme } from './createTheme';

export const simple = createTheme({
  name: 'simple',
  //@ts-expect-error not public api
  simpleStyles: true,
});
