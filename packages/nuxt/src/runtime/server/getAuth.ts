import type { H3Event } from 'h3';

import { moduleRegistrationRequired } from './errors';

export function getAuth(event: H3Event) {
  if (!event.context.auth) {
    throw new Error(moduleRegistrationRequired);
  }

  return event.context.auth;
}
