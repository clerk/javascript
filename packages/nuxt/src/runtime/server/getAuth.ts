import type { GetAuthFn } from '@clerk/backend/internal';
import type { H3Event } from 'h3';

import { moduleRegistrationRequired } from './errors';
import type { AuthOptions } from './types';

export const getAuth: GetAuthFn<H3Event> = ((event: H3Event, options?: AuthOptions) => {
  const authObject = event.context.auth(options);

  if (!authObject) {
    throw new Error(moduleRegistrationRequired);
  }

  return authObject;
}) as GetAuthFn<H3Event>;
