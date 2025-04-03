import type { PendingSessionOptions } from '@clerk/types';
import type { H3Event } from 'h3';

import { moduleRegistrationRequired } from './errors';

export function getAuth(event: H3Event, options?: PendingSessionOptions) {
  const authObject = event.context.auth(options);

  if (!authObject) {
    throw new Error(moduleRegistrationRequired);
  }

  return authObject;
}
