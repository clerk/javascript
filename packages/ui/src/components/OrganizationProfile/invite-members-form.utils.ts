import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIError } from '@clerk/shared/types';

export const classifyInviteMembersError = (error: unknown) => {
  if (!isClerkAPIResponseError(error)) {
    return { kind: 'other' as const, error };
  }

  const apiError: ClerkAPIError | undefined = error.errors[0];
  const longMessage = apiError?.longMessage ?? '';

  return {
    kind: 'api' as const,
    error,
    code: apiError?.code,
    invalidEmails: [...(apiError?.meta?.emailAddresses ?? []), ...(apiError?.meta?.identifiers ?? [])],
    duplicateEmails: apiError?.meta?.emailAddresses ?? [],
    memberEmail: longMessage.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)?.[0],
    seatsQuantity: apiError?.meta?.seatsQuantity,
  };
};
