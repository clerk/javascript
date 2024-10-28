import type { AuthObject } from '@clerk/backend';

declare global {
  namespace Express {
    export interface Request {
      auth: AuthObject;
    }
  }
}
