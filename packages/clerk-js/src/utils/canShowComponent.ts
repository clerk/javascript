import { Clerk, EnvironmentResource } from '@clerk/types';

export const canShowSignIn = (clerk: Clerk, environment?: EnvironmentResource | null) => {
  if (clerk.session && environment?.authConfig.singleSessionMode) {
    return false;
  }

  return true;
};

export const canShowSignUp = (clerk: Clerk, environment?: EnvironmentResource | null) => {
  if (clerk.session && environment?.authConfig.singleSessionMode) {
    return false;
  }

  return true;
};

export const canShowUserProfile = (clerk: Clerk) => {
  if (!clerk.user) {
    return false;
  }

  return true;
};

export const canShowOrganizationProfile = (clerk: Clerk) => {
  if (!clerk.organization) {
    return false;
  }

  return true;
};
