import type {
  EnterpriseAccountConnectionResource,
  EnterpriseAccountResource,
  EnterpriseSSOSettings,
} from '@clerk/shared/types';

type EnterpriseUser = {
  enterpriseAccounts: (Pick<EnterpriseAccountResource, 'active'> & {
    enterpriseConnection?: Pick<EnterpriseAccountConnectionResource, 'disableAdditionalIdentifications'> | null;
  })[];
};

export function allowsIdentificationCreation(
  user: EnterpriseUser,
  enterpriseSSO: Pick<EnterpriseSSOSettings, 'enabled'>,
): boolean {
  if (!enterpriseSSO.enabled) {
    return true;
  }
  return !user.enterpriseAccounts.some(
    account => account.active && account.enterpriseConnection?.disableAdditionalIdentifications,
  );
}
