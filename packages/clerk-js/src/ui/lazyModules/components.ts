import { lazy } from 'react';

const componentImportPaths = {
  SignIn: () => import(/* webpackChunkName: "signin" */ './../components/SignIn'),
  SignUp: () => import(/* webpackChunkName: "signup" */ './../components/SignUp'),
  UserButton: () => import(/* webpackChunkName: "userbutton" */ './../components/UserButton'),
  UserProfile: () => import(/* webpackChunkName: "userprofile" */ './../components/UserProfile'),
  CreateOrganization: () => import(/* webpackChunkName: "createorganization" */ './../components/CreateOrganization'),
  OrganizationProfile: () =>
    import(/* webpackChunkName: "organizationprofile" */ './../components/OrganizationProfile'),
  OrganizationSwitcher: () =>
    import(/* webpackChunkName: "organizationswitcher" */ './../components/OrganizationSwitcher'),
  OrganizationList: () => import(/* webpackChunkName: "organizationlist" */ './../components/OrganizationList'),
  ImpersonationFab: () => import(/* webpackChunkName: "impersonationfab" */ './../components/ImpersonationFab'),
  GoogleOneTap: () => import(/* webpackChunkName: "oneTap" */ './../components/GoogleOneTap'),
} as const;

export const SignIn = lazy(() =>
  componentImportPaths.SignIn().then(module => {
    console.log('react lazy() Clerk:', window.Clerk);
    (window.Clerk as any).__unstable_notifySuspendedSignIn();
    return { default: module.SignIn };
  }),
);

export const SignInModal = lazy(() => componentImportPaths.SignIn().then(module => ({ default: module.SignInModal })));
export const GoogleOneTap = lazy(() =>
  componentImportPaths.GoogleOneTap().then(module => ({ default: module.OneTap })),
);

export const SignUp = lazy(() => componentImportPaths.SignUp().then(module => ({ default: module.SignUp })));

export const SignUpModal = lazy(() => componentImportPaths.SignUp().then(module => ({ default: module.SignUpModal })));

export const UserButton = lazy(() =>
  componentImportPaths.UserButton().then(module => ({ default: module.UserButton })),
);
export const UserProfile = lazy(() =>
  componentImportPaths.UserProfile().then(module => ({ default: module.UserProfile })),
);
export const UserProfileModal = lazy(() =>
  componentImportPaths.UserProfile().then(module => ({ default: module.UserProfileModal })),
);
export const CreateOrganization = lazy(() =>
  componentImportPaths.CreateOrganization().then(module => ({ default: module.CreateOrganization })),
);

export const CreateOrganizationModal = lazy(() =>
  componentImportPaths.CreateOrganization().then(module => ({ default: module.CreateOrganizationModal })),
);

export const OrganizationProfile = lazy(() =>
  componentImportPaths.OrganizationProfile().then(module => ({ default: module.OrganizationProfile })),
);

export const OrganizationProfileModal = lazy(() =>
  componentImportPaths.OrganizationProfile().then(module => ({ default: module.OrganizationProfileModal })),
);

export const OrganizationSwitcher = lazy(() =>
  componentImportPaths.OrganizationSwitcher().then(module => ({ default: module.OrganizationSwitcher })),
);

export const OrganizationList = lazy(() =>
  componentImportPaths.OrganizationList().then(module => ({ default: module.OrganizationList })),
);

export const ImpersonationFab = lazy(() =>
  componentImportPaths.ImpersonationFab().then(module => ({ default: module.ImpersonationFab })),
);

export const preloadComponent = async (component: unknown) => {
  return componentImportPaths[component as keyof typeof componentImportPaths]?.();
};

export const ClerkComponents = {
  SignIn,
  SignUp,
  UserButton,
  UserProfile,
  OrganizationSwitcher,
  OrganizationList,
  OrganizationProfile,
  CreateOrganization,
  SignInModal,
  SignUpModal,
  UserProfileModal,
  OrganizationProfileModal,
  CreateOrganizationModal,
  GoogleOneTap,
};

export type ClerkComponentName = keyof typeof ClerkComponents;
