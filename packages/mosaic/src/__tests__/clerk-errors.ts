import { ClerkAPIResponseError } from '@clerk/shared/error';

export function clerkApiError(code: string, longMessage: string, { paramName }: { paramName?: string } = {}) {
  return new ClerkAPIResponseError(longMessage, {
    data: [
      {
        code,
        message: longMessage,
        long_message: longMessage,
        ...(paramName ? { meta: { param_name: paramName } } : {}),
      },
    ],
    status: 422,
  });
}
