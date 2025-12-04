import type { AuthObject } from '@clerk/backend';
import type { PendingSessionOptions } from '@clerk/shared/types';

declare global {
  namespace Express {
    interface Request {
      auth: AuthObject & {
        (options?: PendingSessionOptions): AuthObject;
      };
    }
  }
}
