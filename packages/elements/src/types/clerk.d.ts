import type { EnvironmentResource } from '@clerk/types';

declare module '@clerk/types' {
  export interface Clerk {
    loaded: boolean;
    addOnLoaded: (callback: () => void) => void;
  }

  export interface LoadedClerk {
    mode: 'browser' | 'server';
    __unstable__environment: EnvironmentResource;
  }
}
