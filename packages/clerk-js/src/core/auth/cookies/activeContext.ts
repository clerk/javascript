import { createCookieHandler } from '@clerk/shared/cookie';

import { getSecureAttribute } from '../getSecureAttribute';

export const createActiveContextCookie = () => {
  const handler = createCookieHandler('clerk_active_context');
  const attributes = { secure: getSecureAttribute('None') };

  return {
    set: (value: string) => {
      handler.set(value, attributes);
    },
    get: () => {
      return handler.get();
    },
    remove: () => {
      return handler.remove(attributes);
    },
  };
};
