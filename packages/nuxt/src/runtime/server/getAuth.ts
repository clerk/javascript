import type { H3Event } from 'h3';

import { moduleRegistrationRequired } from './errors';

export function getAuth(event: H3Event) {
  const authObject = event.context.auth();

  if (!authObject) {
    throw new Error(moduleRegistrationRequired);
  }

  return authObject;
}
