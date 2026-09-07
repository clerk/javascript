import { createCheckAuthorization, splitByScope } from '@clerk/shared/authorization';
import type { CheckAuthorizationWithCustomPermissions, SessionJSONSnapshot } from '@clerk/shared/types';

import { decode } from './utils/jwt';

export { splitByScope };

// This entry contains pure policy only. It creates no Clerk instance, timers, or network client.
export function checkSessionAuthorization(
  session: SessionJSONSnapshot,
  params: Parameters<CheckAuthorizationWithCustomPermissions>[0],
): boolean {
  const membership = session.user?.organization_memberships?.find(
    entry => entry.organization.id === session.last_active_organization_id,
  );
  let features = '';
  let plans = '';
  try {
    const claims = decode(session.last_active_token?.jwt || '').claims;
    features = typeof claims.fea === 'string' ? claims.fea : '';
    plans = typeof claims.pla === 'string' ? claims.pla : '';
  } catch {
    // Organization and reverification checks do not require billing claims.
  }
  return createCheckAuthorization({
    userId: session.user?.id,
    orgId: membership?.organization.id,
    orgRole: membership?.role,
    orgPermissions: membership?.permissions,
    factorVerificationAge: session.factor_verification_age ?? null,
    features,
    plans,
  })(params);
}
