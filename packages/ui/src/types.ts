import type {
  __internal_CheckoutProps,
  OAuthConsentProps,
  __internal_PlanDetailsProps,
  __internal_SubscriptionDetailsProps,
  __internal_UserVerificationProps,
  APIKeysProps,
  ClerkAppearanceTheme,
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
  TaskChooseOrganizationProps,
  TaskResetPasswordProps,
  TaskSetupMFAProps,
  UserAvatarProps,
  UserButtonProps,
  UserProfileProps,
  WaitlistProps,
} from '@clerk/shared/types';
import type { MutableRefObject } from 'react';

import type { WithInternalRouting } from './internal';

export type {
  OAuthConsentProps,
  __internal_UserVerificationProps,
  CreateOrganizationProps,
  GoogleOneTapProps,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  SignInProps,
  SignUpProps,
  UserAvatarProps,
  UserButtonProps,
  UserProfileProps,
  WaitlistProps,
};

export type AvailableComponentProps =
  | SignInProps
  | SignUpProps
  | UserAvatarProps
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
  | APIKeysProps
  | OAuthConsentProps
  | TaskChooseOrganizationProps
  | TaskResetPasswordProps
  | TaskSetupMFAProps;

type ComponentMode = 'modal' | 'mounted';
type SignInMode = 'modal' | 'redirect';

export type SignInCtx = WithInternalRouting<SignInProps> & {
  componentName: 'SignIn';
  mode?: ComponentMode;
} & SignInFallbackRedirectUrl &
  SignInForceRedirectUrl;

export type UserVerificationCtx = WithInternalRouting<__internal_UserVerificationProps> & {
  componentName: 'UserVerification';
  mode?: ComponentMode;
};

export type UserProfileCtx = WithInternalRouting<UserProfileProps> & {
  componentName: 'UserProfile';
  mode?: ComponentMode;
};

export type SignUpCtx = WithInternalRouting<SignUpProps> & {
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

export type UserAvatarCtx = UserAvatarProps & {
  componentName: 'UserAvatar';
};

export type OrganizationProfileCtx = WithInternalRouting<OrganizationProfileProps> & {
  componentName: 'OrganizationProfile';
  mode?: ComponentMode;
};

export type CreateOrganizationCtx = WithInternalRouting<CreateOrganizationProps> & {
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
  redirectUrlComplete: string;
  redirectOnActiveSession?: MutableRefObject<boolean>;
};

export type TaskChooseOrganizationCtx = TaskChooseOrganizationProps & {
  componentName: 'TaskChooseOrganization';
};

export type TaskResetPasswordCtx = TaskResetPasswordProps & {
  componentName: 'TaskResetPassword';
};

export type TaskSetupMFACtx = TaskSetupMFAProps & {
  componentName: 'TaskSetupMFA';
};

export type OAuthConsentCtx = {
  componentName: 'OAuthConsent';
  /**
   * Public-path override forwarded to `useOAuthConsent`. Falls back to the
   * `client_id` query parameter from the current URL when omitted.
   */
  oauthClientId?: string;
  /**
   * Public-path override forwarded to `useOAuthConsent`. Falls back to the
   * `scope` query parameter from the current URL when omitted.
   */
  scope?: string;
  /**
   * Pre-fetched scopes (accounts portal path). Snake-cased to match the
   * legacy FAPI response shape.
   */
  scopes?: {
    scope: string;
    description: string | null;
    requires_consent: boolean;
  }[];
  /**
   * Pre-fetched OAuth application name (accounts portal path).
   */
  oauthApplicationName?: string;
  /**
   * Pre-fetched OAuth application logo URL (accounts portal path).
   */
  oauthApplicationLogoUrl?: string;
  /**
   * Pre-fetched OAuth application URL (accounts portal path).
   */
  oauthApplicationUrl?: string;
  /**
   * Redirect URI to display in the footer. Accounts portal path pre-populates
   * this; public path reads `redirect_uri` from `window.location.search`.
   */
  redirectUrl?: string;
  /**
   * Custom Allow handler (accounts portal path). When omitted, the component
   * submits its internal hidden form instead.
   */
  onAllow?: () => void;
  /**
   * Custom Deny handler (accounts portal path). When omitted, the component
   * submits its internal hidden form instead.
   */
  onDeny?: () => void;
  /**
   * Customize the appearance of the component.
   */
  appearance?: ClerkAppearanceTheme;
  /**
   * When true, renders the organization picker and submits organization_id
   * with the consent form. Internal use only, not exposed in the public prop type.
   */
  enableOrgSelection?: boolean;
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
  | UserAvatarCtx
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
  | PlanDetailsCtx
  | TaskChooseOrganizationCtx
  | TaskResetPasswordCtx
  | TaskSetupMFACtx;
export type AvailableComponentName = AvailableComponentCtx['componentName'];
