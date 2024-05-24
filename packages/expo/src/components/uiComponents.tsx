import {
  OrganizationList as BaseOrganizationList,
  OrganizationProfile as BaseOrganizationProfile,
  OrganizationSwitcher as BaseOrganizationSwitcher,
  SignIn as BaseSignIn,
  SignUp as BaseSignUp,
  UserButton as BaseUserButton,
} from '@clerk/clerk-react';
import React from 'react';
import { Platform, Text } from 'react-native';

const ErrorComponent = () => {
  return <Text>Component not supported on ths platform</Text>;
};

function WrapComponent<T extends { displayName: string }>(component: T) {
  // @ts-expect-error - This is a hack to make the function signature match the original
  return Platform.select<T>({
    // @ts-expect-error - This is a hack to make the function signature match the original
    native: () => ErrorComponent,
    default: () => component,
  })();
}

export const SignIn: typeof BaseSignIn = WrapComponent(BaseSignIn);
export const SignUp: typeof BaseSignUp = WrapComponent(BaseSignUp);
export const UserButton: typeof BaseUserButton = WrapComponent(BaseUserButton);
export const OrganizationProfile: typeof BaseOrganizationProfile = WrapComponent(BaseOrganizationProfile);
export const OrganizationSwitcher: typeof BaseOrganizationSwitcher = WrapComponent(BaseOrganizationSwitcher);
export const OrganizationList: typeof BaseOrganizationList = WrapComponent(BaseOrganizationList);
