import { lazy } from 'react';

const componentImportPaths = {
  SignIn: () => import(/* webpackChunkName: "signin" */ './../components/SignIn'),
  SignUp: () => import(/* webpackChunkName: "signup" */ './../components/SignUp'),
  UserAvatar: () => import(/* webpackChunkName: "useravatar" */ './../components/UserAvatar'),
  UserButton: () => import(/* webpackChunkName: "userbutton" */ './../components/UserButton'),
  UserProfile: () => import(/* webpackChunkName: "userprofile" */ './../components/UserProfile'),
  CreateOrganization: () => import(/* webpackChunkName: "createorganization" */ './../components/CreateOrganization'),
  OrganizationProfile: () =>
    import(/* webpackChunkName: "organizationprofile" */ './../components/OrganizationProfile'),
  OrganizationSwitcher: () =>
    import(/* webpackChunkName: "organizationswitcher" */ './../components/OrganizationSwitcher'),
  OrganizationList: () => import(/* webpackChunkName: "organizationlist" */ './../components/OrganizationList'),
  ImpersonationFab: () => import(/* webpackChunkName: "impersonationfab" */ './../components/ImpersonationFab'),
  GoogleOneTap: () => import(/* webpackChunkName: "onetap" */ './../components/GoogleOneTap'),
  BlankCaptchaModal: () => import(/* webpackChunkName: "blankcaptcha" */ './../components/BlankCaptchaModal'),
  UserVerification: () => import(/* webpackChunkName: "userverification" */ './../components/UserVerification'),
  Waitlist: () => import(/* webpackChunkName: "waitlist" */ './../components/Waitlist'),
  KeylessPrompt: () => import(/* webpackChunkName: "keylessPrompt" */ '../components/KeylessPrompt'),
  PricingTable: () => import(/* webpackChunkName: "pricingTable" */ '../components/PricingTable'),
  Checkout: () => import(/* webpackChunkName: "checkout" */ '../components/Checkout'),
  SessionTasks: () => import(/* webpackChunkName: "sessionTasks" */ '../components/SessionTasks'),
  TaskChooseOrganization: () =>
    import(/* webpackChunkName: "taskChooseOrganization" */ '../components/SessionTasks/tasks/TaskChooseOrganization'),
  PlanDetails: () => import(/* webpackChunkName: "planDetails" */ '../components/Plans/PlanDetails'),
  SubscriptionDetails: () => import(/* webpackChunkName: "subscriptionDetails" */ '../components/SubscriptionDetails'),
  APIKeys: () => import(/* webpackChunkName: "apiKeys" */ '../components/APIKeys/APIKeys'),
  OAuthConsent: () => import(/* webpackChunkName: "oauthConsent" */ '../components/OAuthConsent/OAuthConsent'),
} as const;

export const SignIn = lazy(() => componentImportPaths.SignIn().then(module => ({ default: module.SignIn })));

export const SignInModal = lazy(() => componentImportPaths.SignIn().then(module => ({ default: module.SignInModal })));
export const GoogleOneTap = lazy(() =>
  componentImportPaths.GoogleOneTap().then(module => ({ default: module.OneTap })),
);

export const UserVerification = lazy(() =>
  componentImportPaths.UserVerification().then(module => ({ default: module.UserVerification })),
);

export const UserVerificationModal = lazy(() =>
  componentImportPaths.UserVerification().then(module => ({ default: module.UserVerificationModal })),
);

export const SignUp = lazy(() => componentImportPaths.SignUp().then(module => ({ default: module.SignUp })));

export const SignUpModal = lazy(() => componentImportPaths.SignUp().then(module => ({ default: module.SignUpModal })));

export const UserAvatar = lazy(() =>
  componentImportPaths.UserAvatar().then(module => ({ default: module.UserAvatar })),
);

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

export const Waitlist = lazy(() => componentImportPaths.Waitlist().then(module => ({ default: module.Waitlist })));

export const WaitlistModal = lazy(() =>
  componentImportPaths.Waitlist().then(module => ({ default: module.WaitlistModal })),
);

export const BlankCaptchaModal = lazy(() =>
  componentImportPaths.BlankCaptchaModal().then(module => ({ default: module.BlankCaptchaModal })),
);

export const ImpersonationFab = lazy(() =>
  componentImportPaths.ImpersonationFab().then(module => ({ default: module.ImpersonationFab })),
);
export const KeylessPrompt = lazy(() =>
  componentImportPaths.KeylessPrompt().then(module => ({ default: module.KeylessPrompt })),
);

export const PricingTable = lazy(() =>
  componentImportPaths.PricingTable().then(module => ({ default: module.PricingTable })),
);

export const APIKeys = lazy(() => componentImportPaths.APIKeys().then(module => ({ default: module.APIKeys })));

export const Checkout = lazy(() => componentImportPaths.Checkout().then(module => ({ default: module.Checkout })));

export const TaskChooseOrganization = lazy(() =>
  componentImportPaths.TaskChooseOrganization().then(module => ({ default: module.TaskChooseOrganization })),
);

export const PlanDetails = lazy(() =>
  componentImportPaths.PlanDetails().then(module => ({ default: module.PlanDetails })),
);

export const SubscriptionDetails = lazy(() =>
  componentImportPaths.SubscriptionDetails().then(module => ({ default: module.SubscriptionDetails })),
);

export const OAuthConsent = lazy(() =>
  componentImportPaths.OAuthConsent().then(module => ({ default: module.OAuthConsent })),
);

export const SessionTasks = lazy(() =>
  componentImportPaths.SessionTasks().then(module => ({ default: module.SessionTasks })),
);

export const preloadComponent = async (component: unknown) => {
  return componentImportPaths[component as keyof typeof componentImportPaths]?.();
};

export const ClerkComponents = {
  SignIn,
  SignUp,
  UserAvatar,
  UserButton,
  UserProfile,
  UserVerification,
  OrganizationSwitcher,
  OrganizationList,
  OrganizationProfile,
  CreateOrganization,
  SignInModal,
  SignUpModal,
  UserProfileModal,
  OrganizationProfileModal,
  CreateOrganizationModal,
  UserVerificationModal,
  GoogleOneTap,
  Waitlist,
  WaitlistModal,
  BlankCaptchaModal,
  PricingTable,
  Checkout,
  PlanDetails,
  APIKeys,
  OAuthConsent,
  SubscriptionDetails,
  TaskChooseOrganization,
};

export type ClerkComponentName = keyof typeof ClerkComponents;
