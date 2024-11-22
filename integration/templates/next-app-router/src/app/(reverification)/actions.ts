'use server';

import { auth, reverificationError } from '@clerk/nextjs/server';
import { ReverificationConfig } from '@clerk/types';
const logUserIdActionReverification = async () => {
  const { userId, has } = await auth.protect();

  const config = {
    level: 'second_factor',
    afterMinutes: 1,
  } satisfies ReverificationConfig;

  const userNeedsReverification = !has({
    reverification: config,
  });

  if (userNeedsReverification) {
    return reverificationError(config);
  }

  return {
    userId,
  };
};

export { logUserIdActionReverification };
