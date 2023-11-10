// eslint-disable-next-line no-restricted-imports
import '@emotion/react';

import type { InternalTheme } from '../foundations';

declare module '@emotion/react' {
  export interface Theme extends InternalTheme {}
}
