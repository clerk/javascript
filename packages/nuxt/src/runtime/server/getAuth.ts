import type { SessionAuthObject } from '@clerk/backend';
import { deprecated } from '@clerk/shared/deprecated';
import type { H3Event } from 'h3';

import { moduleRegistrationRequired } from './errors';

/**
 * @deprecated Use `event.context.auth()` instead.
 */
export function getAuth(event: H3Event): SessionAuthObject {
  deprecated('getAuth', 'Use `event.context.auth()` instead.');

  const authObject = event.context.auth();

  if (!authObject) {
    throw new Error(moduleRegistrationRequired);
  }

  return authObject;
}
