import type { __experimental_ReverificationConfig } from '@clerk/types';

type ClerkError<T> = {
  clerk_error: T;
};

const REVERIFICATION_REASON = 'reverification-error';

type ReverificationError<M extends { metadata?: any } = { metadata: unknown }> = ClerkError<
  {
    type: 'forbidden';
    reason: typeof REVERIFICATION_REASON;
  } & M
>;

const __experimental_reverificationError = <MC extends __experimental_ReverificationConfig>(
  missingConfig?: MC,
): ReverificationError<{
  metadata: {
    reverification?: MC;
  };
}> => ({
  clerk_error: {
    type: 'forbidden',
    reason: REVERIFICATION_REASON,
    metadata: {
      reverification: missingConfig,
    },
  },
});

const __experimental_reverificationErrorResponse = (...args: Parameters<typeof __experimental_reverificationError>) =>
  new Response(JSON.stringify(__experimental_reverificationError(...args)), {
    status: 403,
  });

const __experimental_isReverificationHint = (
  result: any,
): result is ReturnType<typeof __experimental_reverificationError> => {
  return (
    result &&
    typeof result === 'object' &&
    'clerk_error' in result &&
    result.clerk_error?.type === 'forbidden' &&
    result.clerk_error?.reason === REVERIFICATION_REASON
  );
};

export {
  __experimental_reverificationError,
  __experimental_reverificationErrorResponse,
  __experimental_isReverificationHint,
};
