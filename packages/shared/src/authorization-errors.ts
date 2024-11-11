import type { ReverificationConfig } from '@clerk/types';

type ClerkError<T> = {
  clerk_error: T;
};

type ReverificationMismatchError<M extends { metadata?: any } = { metadata: unknown }> = ClerkError<
  {
    type: 'forbidden';
    reason: 'reverification-mismatch';
  } & M
>;

const reverificationMismatch = <MC extends ReverificationConfig>(missingConfig?: MC) =>
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

const isReverificationHint = (result: any): result is ReturnType<typeof reverificationMismatch> => {
  return (
    result &&
    typeof result === 'object' &&
    'clerk_error' in result &&
    result.clerk_error?.type === 'forbidden' &&
    result.clerk_error?.reason === 'reverification-mismatch'
  );
};

export { reverificationMismatch, reverificationMismatchResponse, isReverificationHint };
