import type { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/shared/types';

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

export const disabledUserAPIKeysFeature: ComponentGuard = (_, environment) => {
  return !environment?.apiKeysSettings?.user_api_keys_enabled;
};

export const disabledOrganizationAPIKeysFeature: ComponentGuard = (_, environment) => {
  return !environment?.apiKeysSettings?.orgs_api_keys_enabled;
};

export const disabledAllAPIKeysFeatures: ComponentGuard = (_, environment) => {
  return disabledUserAPIKeysFeature(_, environment) && disabledOrganizationAPIKeysFeature(_, environment);
};
