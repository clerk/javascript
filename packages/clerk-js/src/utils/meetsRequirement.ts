import { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/types';

export type Requirements = 'singleSession' | 'user' | 'organization';
export type MeetsRequirement = (
  clerk: Clerk,
  environment?: EnvironmentResource | null,
  options?: ClerkOptions,
) => boolean;

export const meetsRequirement: Record<Requirements, MeetsRequirement> = {
  singleSession: (clerk: Clerk, environment?: EnvironmentResource | null) => {
    if (clerk.session && environment?.authConfig.singleSessionMode) {
      return false;
    }

    return true;
  },

  user: (clerk: Clerk) => {
    if (!clerk.user) {
      return false;
    }

    return true;
  },

  organization: (clerk: Clerk) => {
    if (!clerk.organization) {
      return false;
    }

    return true;
  },
};
