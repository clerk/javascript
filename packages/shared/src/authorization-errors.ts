import type { ReverificationConfig } from './types';

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

const reverificationError = <MC extends ReverificationConfig>(
  missingConfig?: MC,
): ReverificationError<{
  metadata?: {
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

const reverificationErrorResponse = (...args: Parameters<typeof reverificationError>) =>
  new Response(JSON.stringify(reverificationError(...args)), {
    status: 403,
  });

const isReverificationHint = (result: any): result is ReturnType<typeof reverificationError> => {
  return (
    result &&
    typeof result === 'object' &&
    'clerk_error' in result &&
    result.clerk_error?.type === 'forbidden' &&
    result.clerk_error?.reason === REVERIFICATION_REASON
  );
};

export { isReverificationHint, reverificationError, reverificationErrorResponse };
