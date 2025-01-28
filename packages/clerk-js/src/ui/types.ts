import type {
  __internal_UserVerificationProps,
  CreateOrganizationProps,
  GoogleOneTapProps,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
  WaitlistProps,
  WithInternalRouting,
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
  | __internal_UserVerificationProps;

type ComponentMode = 'modal' | 'mounted';

export type SignInCtx = WithInternalRouting<SignInProps> & {
  componentName: 'SignIn';
  mode?: ComponentMode;
};

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
};

export type UserButtonCtx = UserButtonProps & {
  componentName: 'UserButton';
  mode?: ComponentMode;
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
  | WaitlistCtx;

export type AvailableComponentName = AvailableComponentCtx['componentName'];
