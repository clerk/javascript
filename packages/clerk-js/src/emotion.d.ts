// eslint-disable-next-line no-restricted-imports
import '@emotion/react';

import type { InternalTheme } from './ui/foundations';

declare module '@emotion/react' {
  export interface Theme extends InternalTheme {}
}
