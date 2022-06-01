import type { InternalTheme } from '../foundations';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends InternalTheme {}
}
