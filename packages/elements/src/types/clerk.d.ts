import '@clerk/shared/types';

import type { EnvironmentResource } from '@clerk/shared/types';

declare module '@clerk/shared/types' {
  export interface Clerk {
    __unstable__environment: EnvironmentResource | null | undefined;
  }
}
