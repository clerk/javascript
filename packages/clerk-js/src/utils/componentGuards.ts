import type { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/types';

export type ComponentGuard = (
  clerk: Clerk,
  environment?: EnvironmentResource | null,
  options?: ClerkOptions,
) => boolean;

export const isSignedInAndSingleSessionModeEnabled: ComponentGuard = (clerk, environment) => {
  return !!(clerk.isSignedIn && environment?.authConfig.singleSessionMode);
};

export const noUserExists: ComponentGuard = clerk => {
  return !clerk.user;
};

export const noOrganizationExists: ComponentGuard = clerk => {
  return !clerk.organization;
};

export const disabledOrganizationsFeature: ComponentGuard = (_, environment) => {
  return !environment?.organizationSettings.enabled;
};

export const disabledUserBillingFeature: ComponentGuard = (_, environment) => {
  return !environment?.commerceSettings.billing.user.enabled;
};

export const disabledOrganizationBillingFeature: ComponentGuard = (_, environment) => {
  return !environment?.commerceSettings.billing.organization.enabled;
};

export const disabledAllBillingFeatures: ComponentGuard = (_, environment) => {
  return disabledUserBillingFeature(_, environment) && disabledOrganizationBillingFeature(_, environment);
};

export const hasPaidOrgPlans: ComponentGuard = (_, environment) => {
  return environment?.commerceSettings.billing.organization.hasPaidPlans || false;
};

export const hasPaidUserPlans: ComponentGuard = (_, environment) => {
  return environment?.commerceSettings.billing.user.hasPaidPlans || false;
};

export const disabledAPIKeysFeature: ComponentGuard = (_, environment) => {
  return !environment?.apiKeysSettings?.enabled;
};

export const canViewOrManageAPIKeys: ComponentGuard = clerk => {
  if (!clerk.session) {
    return false;
  }

  return (
    clerk.session.checkAuthorization({ permission: 'org:sys_api_keys:read' }) ||
    clerk.session.checkAuthorization({ permission: 'org:sys_api_keys:manage' })
  );
};
