import {
  CreateOrganization as BaseCreateOrganization,
  GoogleOneTap as BaseGoogleOneTap,
  OrganizationList as BaseOrganizationList,
  OrganizationProfile as BaseOrganizationProfile,
  OrganizationSwitcher as BaseOrganizationSwitcher,
  SignIn as BaseSignIn,
  SignInButton as BaseSignInButton,
  SignInWithMetamaskButton as BaseSignInWithMetamaskButton,
  SignOutButton as BaseSignOutButton,
  SignUp as BaseSignUp,
  SignUpButton as BaseSignUpButton,
  UserButton as BaseUserButton,
  UserProfile as BaseUserProfile,
} from '@clerk/clerk-react';
import { Platform } from 'react-native';

import { errorThrower } from '../utils/errors';

const ErrorComponent = (componentName: string) => {
  throw errorThrower.throw(`${componentName} component is not supported in the native environments.`);
};

function WrapComponent<T extends { displayName: string }>(component: T) {
  const commonentName = component.displayName.replace('withClerk(', '').replace(')', '');

  // @ts-expect-error - This is just to make the function signature match the original
  return Platform.select<T>({
    // @ts-expect-error - This is just to make the function signature match the original
    native: () => () => ErrorComponent(commonentName),
    default: () => component,
  })();
}

export const SignIn: typeof BaseSignIn = WrapComponent(BaseSignIn);
export const SignUp: typeof BaseSignUp = WrapComponent(BaseSignUp);

export const UserButton: typeof BaseUserButton = WrapComponent(BaseUserButton);
export const UserProfile: typeof BaseUserProfile = WrapComponent(BaseUserProfile);

export const OrganizationProfile: typeof BaseOrganizationProfile = WrapComponent(BaseOrganizationProfile);
export const OrganizationSwitcher: typeof BaseOrganizationSwitcher = WrapComponent(BaseOrganizationSwitcher);
export const OrganizationList: typeof BaseOrganizationList = WrapComponent(BaseOrganizationList);
export const CreateOrganization: typeof BaseCreateOrganization = WrapComponent(BaseCreateOrganization);

export const SignInButton: typeof BaseSignInButton = WrapComponent(BaseSignInButton);
export const SignUpButton: typeof BaseSignUpButton = WrapComponent(BaseSignUpButton);
export const SignOutButton: typeof BaseSignOutButton = WrapComponent(BaseSignOutButton);
export const SignInWithMetamaskButton: typeof BaseSignInWithMetamaskButton =
  WrapComponent(BaseSignInWithMetamaskButton);
export const GoogleOneTap: typeof BaseGoogleOneTap = WrapComponent(BaseGoogleOneTap);
