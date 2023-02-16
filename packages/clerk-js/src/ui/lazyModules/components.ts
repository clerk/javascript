import { lazy } from 'react';

export const SignIn = lazy(() =>
  import(/* webpackChunkName: "SignIn" */ './../components/SignIn').then(module => ({ default: module.SignIn })),
);

export const SignInModal = lazy(() =>
  import(/* webpackChunkName: "SignInModal" */ './../components/SignIn').then(module => ({
    default: module.SignInModal,
  })),
);

export const SignUp = lazy(() =>
  import(/* webpackChunkName: "SignUp" */ './../components/SignUp').then(module => ({ default: module.SignUp })),
);

export const SignUpModal = lazy(() =>
  import(/* webpackChunkName: "SignUpModal" */ './../components/SignUp').then(module => ({
    default: module.SignUpModal,
  })),
);

export const UserButton = lazy(() =>
  import(/* webpackChunkName: "UserButton" */ './../components/UserButton').then(module => ({
    default: module.UserButton,
  })),
);

export const UserProfile = lazy(() =>
  import(/* webpackChunkName: "UserProfile" */ './../components/UserProfile').then(module => ({
    default: module.UserProfile,
  })),
);

export const UserProfileModal = lazy(() =>
  import(/* webpackChunkName: "UserProfileModal" */ './../components/UserProfile').then(module => ({
    default: module.UserProfileModal,
  })),
);

export const CreateOrganization = lazy(() => {
  return import(/* webpackChunkName: "CreateOrganization" */ './../components/CreateOrganization').then(module => ({
    default: module.CreateOrganization,
  }));
});

export const CreateOrganizationModal = lazy(() =>
  import(/* webpackChunkName: "CreateOrganizationModal" */ './../components/CreateOrganization').then(module => ({
    default: module.CreateOrganizationModal,
  })),
);

export const OrganizationProfile = lazy(() =>
  import(/* webpackChunkName: "OrganizationProfile" */ './../components/OrganizationProfile').then(module => ({
    default: module.OrganizationProfile,
  })),
);

export const OrganizationProfileModal = lazy(() =>
  import(/* webpackChunkName: "OrganizationProfileModal" */ './../components/OrganizationProfile').then(module => ({
    default: module.OrganizationProfileModal,
  })),
);

export const OrganizationSwitcher = lazy(() =>
  import(/* webpackChunkName: "OrganizationSwitcher" */ './../components/OrganizationSwitcher').then(module => ({
    default: module.OrganizationSwitcher,
  })),
);

export const ImpersonationFab = lazy(() =>
  import(/* webpackChunkName: "ImpersonationFab" */ './../components/ImpersonationFab').then(module => ({
    default: module.ImpersonationFab,
  })),
);

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
