import { useEffect, useRef } from 'react';

import { useClerk } from './useClerk';

/**
 * Attempts to enable the organizations environment setting for a given caller
 *
 * @internal
 */
export function useAttemptToEnableOrganizations(caller: 'useOrganization' | 'useOrganizationList') {
  const clerk = useClerk();
  const hasAttempted = useRef(false);

  useEffect(() => {
    // Guard to not run this effect twice on Clerk resource update
    if (hasAttempted.current) {
      return;
    }

    hasAttempted.current = true;
    // Optional chaining is important for `@clerk/clerk-react` usage with older clerk-js versions that don't have the method
    clerk.__internal_attemptToEnableEnvironmentSetting?.({
      for: 'organizations',
      caller,
    });
  }, [clerk, caller]);
}
