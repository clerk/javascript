import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIError } from '@clerk/types';

export function isError(err: ClerkAPIResponseError, code = ''): boolean {
  return err.errors && !!err.errors.find((e: ClerkAPIError) => e.code === code);
}
