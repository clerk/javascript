import type {
  __internal_CheckoutProps,
  __internal_OAuthConsentProps,
  __internal_PlanDetailsProps,
  __internal_SubscriptionDetailsProps,
  __internal_UserVerificationProps,
  APIKeysProps,
  CreateOrganizationProps,
  GoogleOneTapProps,
  NewSubscriptionRedirectUrl,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  PricingTableProps,
  SignInFallbackRedirectUrl,
  SignInForceRedirectUrl,
  SignInProps,
  SignUpFallbackRedirectUrl,
  SignUpForceRedirectUrl,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
  WaitlistProps,
} from '@clerk/types';

export type {
  GoogleOneTapProps,
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
  OrganizationSwitcherProps,
  OrganizationProfileProps,
  CreateOrganizationProps,
  OrganizationListProps,
  WaitlistProps,
  __internal_UserVerificationProps,
  __internal_OAuthConsentProps,
};

export type AvailableComponentProps =
  | SignInProps
  | SignUpProps
  | UserProfileProps
  | UserButtonProps
  | OrganizationSwitcherProps
  | OrganizationProfileProps
  | CreateOrganizationProps
  | OrganizationListProps
  | WaitlistProps
  | PricingTableProps
  | __internal_CheckoutProps
  | __internal_UserVerificationProps
  | __internal_SubscriptionDetailsProps
  | __internal_PlanDetailsProps
  | APIKeysProps;

type ComponentMode = 'modal' | 'mounted';
type SignInMode = 'modal' | 'redirect';

export type SignInCtx = SignInProps & {
  componentName: 'SignIn';
  mode?: ComponentMode;
} & SignInFallbackRedirectUrl &
  SignInForceRedirectUrl;

export type UserVerificationCtx = __internal_UserVerificationProps & {
  componentName: 'UserVerification';
  mode?: ComponentMode;
};

export type UserProfileCtx = UserProfileProps & {
  componentName: 'UserProfile';
  mode?: ComponentMode;
};

export type SignUpCtx = SignUpProps & {
  componentName: 'SignUp';
  mode?: ComponentMode;
  emailLinkRedirectUrl?: string;
  ssoCallbackUrl?: string;
} & SignUpFallbackRedirectUrl &
  SignUpForceRedirectUrl;

export type UserButtonCtx = UserButtonProps & {
  componentName: 'UserButton';
  mode?: ComponentMode;
};

export type OrganizationProfileCtx = OrganizationProfileProps & {
  componentName: 'OrganizationProfile';
  mode?: ComponentMode;
};

export type CreateOrganizationCtx = CreateOrganizationProps & {
  componentName: 'CreateOrganization';
  mode?: ComponentMode;
};

export type OrganizationSwitcherCtx = OrganizationSwitcherProps & {
  componentName: 'OrganizationSwitcher';
  mode?: ComponentMode;
};

export type OrganizationListCtx = OrganizationListProps & {
  componentName: 'OrganizationList';
  mode?: ComponentMode;
};

export type GoogleOneTapCtx = GoogleOneTapProps & {
  componentName: 'GoogleOneTap';
};

export type WaitlistCtx = WaitlistProps & {
  componentName: 'Waitlist';
  mode?: ComponentMode;
};

export type PricingTableCtx = PricingTableProps & {
  componentName: 'PricingTable';
  mode?: ComponentMode;
  signInMode?: SignInMode;
};

export type APIKeysCtx = APIKeysProps & {
  componentName: 'APIKeys';
  mode?: ComponentMode;
};

export type CheckoutCtx = __internal_CheckoutProps & {
  componentName: 'Checkout';
} & NewSubscriptionRedirectUrl;

export type SessionTasksCtx = {
  nextTask: () => Promise<void>;
  redirectUrlComplete?: string;
  currentTaskContainer: React.RefObject<HTMLDivElement> | null;
};

export type OAuthConsentCtx = __internal_OAuthConsentProps & {
  componentName: 'OAuthConsent';
};

export type SubscriptionDetailsCtx = __internal_SubscriptionDetailsProps & {
  componentName: 'SubscriptionDetails';
};

export type PlanDetailsCtx = __internal_PlanDetailsProps & {
  componentName: 'PlanDetails';
};

export type AvailableComponentCtx =
  | SignInCtx
  | SignUpCtx
  | UserButtonCtx
  | UserProfileCtx
  | UserVerificationCtx
  | OrganizationProfileCtx
  | CreateOrganizationCtx
  | OrganizationSwitcherCtx
  | OrganizationListCtx
  | GoogleOneTapCtx
  | WaitlistCtx
  | PricingTableCtx
  | CheckoutCtx
  | APIKeysCtx
  | OAuthConsentCtx
  | SubscriptionDetailsCtx
  | PlanDetailsCtx;
export type AvailableComponentName = AvailableComponentCtx['componentName'];
