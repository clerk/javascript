import type { AuthObject } from '@clerk/backend';

declare module 'h3' {
  interface H3EventContext {
    auth: AuthObject;
  }
}
