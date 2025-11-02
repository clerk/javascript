// eslint-disable-next-line no-restricted-imports
import '@emotion/react';

import type { InternalTheme } from './foundations';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Theme extends InternalTheme {}
}
