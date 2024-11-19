'use server';

import { auth } from '@clerk/nextjs/server';
import { __experimental_reverificationError as reverificationError } from '@clerk/shared/authorization-errors';
import { __experimental_ReverificationConfig } from '@clerk/types';

const logUserIdActionReverification = async () => {
  const { userId, has } = await auth.protect();

  const config = {
    level: 'second_factor',
    afterMinutes: 1,
  } satisfies __experimental_ReverificationConfig;

  const userNeedsReverification = !has({
    __experimental_reverification: config,
  });

  if (userNeedsReverification) {
    return reverificationError(config);
  }

  return {
    userId,
  };
};

export { logUserIdActionReverification };
