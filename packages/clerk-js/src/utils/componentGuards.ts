import type { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/types';

export type ComponentGuard = (
  clerk: Clerk,
  environment?: EnvironmentResource | null,
  options?: ClerkOptions,
) => boolean;

export const sessionExistsAndSingleSessionModeEnabled: ComponentGuard = (clerk, environment) => {
  return !!(clerk.session && environment?.authConfig.singleSessionMode);
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

export const disabledBillingFeature: ComponentGuard = (_, environment) => {
  return !environment?.commerceSettings.billing.enabled;
};

export const hasPaidOrgPlans: ComponentGuard = (_, environment) => {
  return environment?.commerceSettings.billing.hasPaidOrgPlans || false;
};

export const hasPaidUserPlans: ComponentGuard = (_, environment) => {
  return environment?.commerceSettings.billing.hasPaidUserPlans || false;
};

export const disabledAPIKeysFeature: ComponentGuard = (_, environment) => {
  return !environment?.apiKeysSettings?.enabled;
};
