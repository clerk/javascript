'use server';

import { auth, reverificationMismatch } from '@clerk/nextjs/server';

const logUserIdActionReverification = async () => {
  const { userId, has } = await auth.protect();

  const config = {
    level: 'secondFactor',
    afterMinutes: 1,
  } as const;

  const userNeedsReverification = !has({
    reverification: config,
  });

  if (userNeedsReverification) {
    return reverificationMismatch(config);
  }

  return {
    userId,
  };
};

export { logUserIdActionReverification };
