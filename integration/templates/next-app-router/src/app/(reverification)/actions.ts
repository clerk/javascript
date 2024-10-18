'use server';

import { auth } from '@clerk/nextjs/server';
import { reverificationMismatch } from '@clerk/shared/authorization-errors';

const logUserIdActionReverification = async () => {
  const { userId } = auth().protect();

  const config = {
    level: 'secondFactor',
    afterMinutes: 1,
  } as const;

  if (
    !auth().has({
      __experimental_reverification: config,
    })
  ) {
    return reverificationMismatch(config);
  }

  return {
    userId,
  };
};

export { logUserIdActionReverification };
