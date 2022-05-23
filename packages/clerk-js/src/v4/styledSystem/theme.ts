import type { BaseTheme } from '../foundations';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends BaseTheme {}
}
