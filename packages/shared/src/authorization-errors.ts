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

const __experimental_reverificationMismatch = <MC extends __experimental_ReverificationConfig>(missingConfig?: MC) =>
  ({
    clerk_error: {
      type: 'forbidden',
      reason: 'reverification-mismatch',
      metadata: {
        reverification: missingConfig,
      },
    },
  }) satisfies ReverificationMismatchError;

const __experimental_reverificationMismatchResponse = (
  ...args: Parameters<typeof __experimental_reverificationMismatch>
) =>
  new Response(JSON.stringify(__experimental_reverificationMismatch(...args)), {
    status: 403,
  });

const __experimental_isReverificationHint = (
  result: any,
): result is ReturnType<typeof __experimental_reverificationMismatch> => {
  return (
    result &&
    typeof result === 'object' &&
    'clerk_error' in result &&
    result.clerk_error?.type === 'forbidden' &&
    result.clerk_error?.reason === 'reverification-mismatch'
  );
};

export {
  __experimental_reverificationMismatch,
  __experimental_reverificationMismatchResponse,
  __experimental_isReverificationHint,
};
