import { useSession } from '@clerk/shared/react';

/**
 * Return shape for {@link useAms}. The claim is opaque, so callers should
 * only branch on whether it is present.
 */
export type UseAmsReturn = {
  isActive: boolean;
};

const INACTIVE: UseAmsReturn = {
  isActive: false,
};

/**
 * Returns information about the optional `ams` claim on the active
 * session. The claim shape is intentionally opaque.
 *
 * Reactive — re-renders when the session token rotates.
 */
export const useAms = (): UseAmsReturn => {
  const { session } = useSession();
  const claims = session?.lastActiveToken?.jwt?.claims;

  if (!claims || !Object.prototype.hasOwnProperty.call(claims, 'ams')) {
    return INACTIVE;
  }

  return {
    isActive: true,
  };
};
