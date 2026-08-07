import { useSession } from '@clerk/shared/react';

import { useMosaicEnvironment } from '../hooks/useMosaicEnvironment';

type OrganizationBillingPanelController = { status: 'loading' } | { status: 'hidden' } | { status: 'ready' };

/**
 * Panel-level gate for the organization billing tab. Mirrors the legacy route guard
 * (`commerceSettings.billing.organization.enabled` plus a `org:sys_billing:read`/`:manage`
 * `Protect`): the whole panel stays hidden for members who can neither read nor manage billing,
 * or when organization billing is disabled for the instance. Individual sections still self-gate
 * on top of this.
 */
export function useOrganizationBillingPanelController(): OrganizationBillingPanelController {
  const { isLoaded: isSessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();

  if (!isSessionLoaded || !environment) {
    return { status: 'loading' };
  }

  const canRead = session?.checkAuthorization({ permission: 'org:sys_billing:read' }) ?? false;
  const canManage = session?.checkAuthorization({ permission: 'org:sys_billing:manage' }) ?? false;

  if (!environment.commerceSettings.billing.organization.enabled || !(canRead || canManage)) {
    return { status: 'hidden' };
  }

  return { status: 'ready' };
}
