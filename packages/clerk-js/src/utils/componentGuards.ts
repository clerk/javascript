import type { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/types';

export type ComponentGuard = (
  clerk: Clerk,
  environment?: EnvironmentResource | null,
  options?: ClerkOptions,
) => boolean;

// todo -> add tests
// is signed in, and single session mode enabled, and active session -> redirect to after sign in
// is signed in, and single session mode, and pending session => redirect to task
// is signed in, and multi session mode, and active session -> let it be
// is signed in, and multi session mode, and pending session -> let it be
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
