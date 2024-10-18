import type { __experimental_ReverificationConfig } from '@clerk/types';

type ClerkError<T> = {
  clerk_error: T;
};

type ReverificationMismatchError<M extends { metadata?: any } = { metadata: unknown }> = ClerkError<
  {
    type: 'forbidden';
    reason: 'reverification-mismatch';
  } & M
>;

const reverificationMismatch = <MC extends __experimental_ReverificationConfig>(missingConfig: MC) =>
  ({
    clerk_error: {
      type: 'forbidden',
      reason: 'reverification-mismatch',
      metadata: {
        reverification: missingConfig,
      },
    },
  }) satisfies ReverificationMismatchError;

const reverificationMismatchResponse = (...args: Parameters<typeof reverificationMismatch>) =>
  new Response(JSON.stringify(reverificationMismatch(...args)), {
    status: 403,
  });

export { reverificationMismatch, reverificationMismatchResponse };
