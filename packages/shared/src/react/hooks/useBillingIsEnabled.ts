import type { ForPayerType } from '../../types/billing';
import { useClerkInstanceContext } from '../contexts';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useUserBase } from './base/useUserBase';

/**
 * @internal
 */
export function useBillingIsEnabled(params?: { for?: ForPayerType; enabled?: boolean; authenticated?: boolean }) {
  const clerk = useClerkInstanceContext();

  const enabledFromParam = params?.enabled ?? true;

  // @ts-expect-error `__internal_environment` is not typed
  const environment = clerk.__internal_environment as unknown as EnvironmentResource | null | undefined;

  const user = useUserBase();
  const organization = useOrganizationBase();

  const userBillingEnabled = environment?.commerceSettings.billing.user.enabled;
  const orgBillingEnabled = environment?.commerceSettings.billing.organization.enabled;

  const billingEnabled =
    params?.for === 'organization'
      ? orgBillingEnabled
      : params?.for === 'user'
        ? userBillingEnabled
        : userBillingEnabled || orgBillingEnabled;

  const isOrganization = params?.for === 'organization';
  const requireUserAndOrganizationWhenAuthenticated =
    (params?.authenticated ?? true) ? (isOrganization ? Boolean(organization?.id) : true) && Boolean(user?.id) : true;

  return billingEnabled && enabledFromParam && clerk.loaded && requireUserAndOrganizationWhenAuthenticated;
}
