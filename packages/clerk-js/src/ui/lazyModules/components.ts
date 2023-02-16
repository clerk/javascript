import { lazy } from 'react';

export const SignIn = lazy(() => {
  return import('./../components/SignIn').then(module => ({ default: module.SignIn }));
});

export const SignInModal = lazy(() => {
  return import('./../components/SignIn').then(module => ({ default: module.SignInModal }));
});

export const SignUp = lazy(() => {
  return import('./../components/SignUp').then(module => ({ default: module.SignUp }));
});

export const SignUpModal = lazy(() => {
  return import('./../components/SignUp').then(module => ({ default: module.SignUpModal }));
});

export const UserButton = lazy(() => {
  return import('./../components/UserButton').then(module => ({ default: module.UserButton }));
});

export const UserProfile = lazy(() => {
  return import('./../components/UserProfile').then(module => ({ default: module.UserProfile }));
});

export const UserProfileModal = lazy(() => {
  return import('./../components/UserProfile').then(module => ({ default: module.UserProfileModal }));
});

export const CreateOrganization = lazy(() => {
  return import('./../components/CreateOrganization').then(module => ({ default: module.CreateOrganization }));
});

export const CreateOrganizationModal = lazy(() => {
  return import('./../components/CreateOrganization').then(module => ({ default: module.CreateOrganizationModal }));
});

export const OrganizationProfile = lazy(() => {
  return import('./../components/OrganizationProfile').then(module => ({ default: module.OrganizationProfile }));
});

export const OrganizationProfileModal = lazy(() => {
  return import('./../components/OrganizationProfile').then(module => ({ default: module.OrganizationProfileModal }));
});

export const OrganizationSwitcher = lazy(() => {
  return import('./../components/OrganizationSwitcher').then(module => ({ default: module.OrganizationSwitcher }));
});

export const ImpersonationFab = lazy(() => {
  return import('./../components/ImpersonationFab').then(module => ({ default: module.ImpersonationFab }));
});

export const ClerkComponents = {
  SignIn,
  SignUp,
  UserButton,
  UserProfile,
  OrganizationSwitcher,
  OrganizationProfile,
  CreateOrganization,
  SignInModal,
  SignUpModal,
  UserProfileModal,
  OrganizationProfileModal,
  CreateOrganizationModal,
  ImpersonationFab,
};

export type ClerkComponentName = keyof typeof ClerkComponents;
