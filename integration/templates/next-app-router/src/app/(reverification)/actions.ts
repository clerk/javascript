'use server';

import { auth } from '@clerk/nextjs/server';
import { __experimental_reverificationMismatch as reverificationMismatch } from '@clerk/shared/authorization-errors';

const logUserIdActionReverification = async () => {
  const { userId, has } = await auth.protect();

  const config = {
    level: 'secondFactor',
    afterMinutes: 1,
  } as const;

  const userNeedsReverification = !has({
    __experimental_reverification: config,
  });

  if (userNeedsReverification) {
    return reverificationMismatch(config);
  }

  return {
    userId,
  };
};

export { logUserIdActionReverification };
