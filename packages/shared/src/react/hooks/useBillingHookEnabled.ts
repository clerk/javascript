import type { ForPayerType } from '../../types/billing';
import { useClerkInstanceContext, useOrganizationContext, useUserContext } from '../contexts';

/**
 * @internal
 */
export function useBillingHookEnabled(params?: { for?: ForPayerType; enabled?: boolean; authenticated?: boolean }) {
  const clerk = useClerkInstanceContext();

  const enabledFromParam = params?.enabled ?? true;

  // @ts-expect-error `__internal_environment` is not typed
  const environment = clerk.__internal_environment as unknown as EnvironmentResource | null | undefined;

  const user = useUserContext();
  const { organization } = useOrganizationContext();

  const isOrganization = params?.for === 'organization';
  const billingEnabled = isOrganization
    ? environment?.commerceSettings.billing.organization.enabled
    : environment?.commerceSettings.billing.user.enabled;

  const requireUserAndOrganizationWhenAuthenticated =
    (params?.authenticated ?? true) ? (isOrganization ? Boolean(organization?.id) : true) && Boolean(user?.id) : true;

  return billingEnabled && enabledFromParam && clerk.loaded && requireUserAndOrganizationWhenAuthenticated;
}
