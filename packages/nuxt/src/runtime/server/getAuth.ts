import type { AuthenticateRequestOptions, GetAuthFn } from '@clerk/backend/internal';
import type { H3Event } from 'h3';

import { moduleRegistrationRequired } from './errors';

export type GetAuthOptions = { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

export const getAuth: GetAuthFn<H3Event> = ((event: H3Event, options?: GetAuthOptions) => {
  const authObject = event.context.auth(options);

  if (!authObject) {
    throw new Error(moduleRegistrationRequired);
  }

  return authObject;
}) as GetAuthFn<H3Event>;
