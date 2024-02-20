import '@clerk/types';

import type { EnvironmentResource } from '@clerk/types';

declare module '@clerk/types' {
  export interface Clerk {
    __unstable__environment: EnvironmentResource | null | undefined;
  }
}
