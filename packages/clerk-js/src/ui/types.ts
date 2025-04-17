import type {
  __experimental_CheckoutProps,
  __experimental_CommerceInvoiceResource,
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriberType,
  __experimental_CommerceSubscriptionResource,
  __experimental_PricingTableProps,
  __experimental_SubscriptionDetailDrawerProps,
  __internal_UserVerificationProps,
  CreateOrganizationProps,
  GoogleOneTapProps,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
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
  | __experimental_PricingTableProps
  | __experimental_CheckoutProps
  | __internal_UserVerificationProps
  | __experimental_SubscriptionDetailDrawerProps;

type ComponentMode = 'modal' | 'mounted';

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

export type __experimental_PricingTableCtx = __experimental_PricingTableProps & {
  componentName: 'PricingTable';
  mode?: ComponentMode;
  subscriberType?: __experimental_CommerceSubscriberType;
};

export type __experimental_CheckoutCtx = __experimental_CheckoutProps & {
  componentName: 'Checkout';
};

export type __experimental_SubscriptionDetailDrawerCtx = __experimental_SubscriptionDetailDrawerProps & {
  componentName: 'SubscriptionDetailDrawer';
};

export type __experimental_PaymentSourcesCtx = {
  componentName: 'PaymentSources';
  subscriberType?: __experimental_CommerceSubscriberType;
};

export type __experimental_InvoicesCtx = {
  componentName: 'Invoices';
  subscriberType: __experimental_CommerceSubscriberType;
  invoices: __experimental_CommerceInvoiceResource[];
  totalCount: number;
  isLoading: boolean;
  revalidate: () => void;
  getInvoiceById: (invoiceId: string) => __experimental_CommerceInvoiceResource | undefined;
};

export type __experimental_PlansCtx = {
  componentName: 'Plans';
  subscriberType: __experimental_CommerceSubscriberType;
  plans: __experimental_CommercePlanResource[];
  subscriptions: __experimental_CommerceSubscriptionResource[];
  isLoading: boolean;
  revalidate: () => void;
  activeOrUpcomingSubscription: (
    plan: __experimental_CommercePlanResource,
  ) => __experimental_CommerceSubscriptionResource | undefined;
  isDefaultPlanImplicitlyActive: boolean;
};

export type SessionTasksCtx = {
  nextTask: () => Promise<void>;
  redirectUrlComplete?: string;
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
  | __experimental_PricingTableCtx
  | __experimental_CheckoutCtx
  | __experimental_SubscriptionDetailDrawerCtx;
export type AvailableComponentName = AvailableComponentCtx['componentName'];
