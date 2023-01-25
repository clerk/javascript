import { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/types';

export type ClerkRequirement = (
  clerk: Clerk,
  environment?: EnvironmentResource | null,
  options?: ClerkOptions,
) => boolean;

export const sessionExistsAndSingleSessionModeEnabled: ClerkRequirement = (
  clerk: Clerk,
  environment?: EnvironmentResource | null,
) => {
  return !!(clerk.session && environment?.authConfig.singleSessionMode);
};

export const noUserExists: ClerkRequirement = (clerk: Clerk) => {
  return !clerk.user;
};

export const noOrganizationExists: ClerkRequirement = (clerk: Clerk) => {
  return !clerk.organization;
};
