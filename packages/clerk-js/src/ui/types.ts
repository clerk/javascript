import type {
  __internal_UserVerificationProps,
  CheckoutProps,
  CommerceInvoiceResource,
  CommercePlanResource,
  CommerceSubscriptionResource,
  CreateOrganizationProps,
  GoogleOneTapProps,
  NewSubscriptionRedirectUrl,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  PlanDetailsProps,
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
  | CheckoutProps
  | __internal_UserVerificationProps
  | PlanDetailsProps;

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

export type PricingTableCtx = PricingTableProps & {
  componentName: 'PricingTable';
  mode?: ComponentMode;
};

export type CheckoutCtx = CheckoutProps & {
  componentName: 'Checkout';
} & NewSubscriptionRedirectUrl;

export type PaymentSourcesCtx = {
  componentName: 'PaymentSources';
};

export type InvoicesCtx = {
  componentName: 'Invoices';
  invoices: CommerceInvoiceResource[];
  totalCount: number;
  isLoading: boolean;
  revalidate: () => void;
  getInvoiceById: (invoiceId: string) => CommerceInvoiceResource | undefined;
};

export type PlansCtx = {
  componentName: 'Plans';
  plans: CommercePlanResource[];
  subscriptions: CommerceSubscriptionResource[];
  isLoading: boolean;
  revalidate: () => void;
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
  | PricingTableCtx
  | CheckoutCtx;
export type AvailableComponentName = AvailableComponentCtx['componentName'];
