import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal';
import type { H3Event } from 'h3';

import { moduleRegistrationRequired } from './errors';

export function getAuth(event: H3Event): SignedInAuthObject | SignedOutAuthObject {
  const authObject = event.context.auth();

  if (!authObject) {
    throw new Error(moduleRegistrationRequired);
  }

  return authObject;
}
