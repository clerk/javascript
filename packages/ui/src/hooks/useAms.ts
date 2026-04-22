import { useSession } from '@clerk/shared/react';
import type { AmsClaim } from '@clerk/shared/types';

/**
 * Return shape for {@link useAms}. Splits the "claim absent" case from
 * the "claim present" case so callers can use `hasScope` unconditionally
 * — when the claim is absent `hasScope` always returns `true`, meaning
 * sites that read `if (!hasScope('foo')) hide()` keep working on
 * regular sessions.
 */
export type UseAmsReturn =
  | {
      isActive: false;
      appId: undefined;
      scopes: undefined;
      hasScope: () => true;
    }
  | {
      isActive: true;
      appId: string;
      scopes: string[];
      hasScope: (scope: string) => boolean;
    };

const INACTIVE: UseAmsReturn = {
  isActive: false,
  appId: undefined,
  scopes: undefined,
  hasScope: () => true,
};

/**
 * Returns information about the optional `ams` claim on the active
 * session. When the claim is present the session is operating under a
 * restricted scope; the returned `hasScope` helper can be used to gate
 * UI on individual scope strings.
 *
 * Reactive — re-renders when the session token rotates.
 */
export const useAms = (): UseAmsReturn => {
  const { session } = useSession();
  const ams = session?.lastActiveToken?.jwt?.claims.ams as AmsClaim | undefined;

  if (!ams || typeof ams.app_id !== 'string') {
    return INACTIVE;
  }

  const scopes = Array.isArray(ams.scopes) ? ams.scopes : [];
  return {
    isActive: true,
    appId: ams.app_id,
    scopes,
    hasScope: (scope: string) => scopes.includes(scope),
  };
};
