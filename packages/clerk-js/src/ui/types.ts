import type {
  __internal_UserVerificationProps,
  CreateOrganizationProps,
  GoogleOneTapProps,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  RoutingStrategy,
  SignInProps,
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
  | __internal_UserVerificationProps;

type ComponentMode = 'modal' | 'mounted';

export type SignInCtx = Omit<SignInProps, 'routing'> &
  __internal_RoutingOptions & {
    componentName: 'SignIn';
    mode?: ComponentMode;
  };

export type UserVerificationCtx = Omit<__internal_UserVerificationProps, 'routing'> &
  __internal_RoutingOptions & {
    componentName: 'UserVerification';
    mode?: ComponentMode;
  };

export type UserProfileCtx = Omit<UserProfileProps, 'routing'> &
  __internal_RoutingOptions & {
    componentName: 'UserProfile';
    mode?: ComponentMode;
  };

export type SignUpCtx = Omit<SignUpProps, 'routing'> &
  __internal_RoutingOptions & {
    componentName: 'SignUp';
    mode?: ComponentMode;
    emailLinkRedirectUrl?: string;
    ssoCallbackUrl?: string;
  };

export type UserButtonCtx = UserButtonProps & {
  componentName: 'UserButton';
  mode?: ComponentMode;
};

export type OrganizationProfileCtx = Omit<OrganizationProfileProps, 'routing'> &
  __internal_RoutingOptions & {
    componentName: 'OrganizationProfile';
    mode?: ComponentMode;
  };

export type CreateOrganizationCtx = Omit<CreateOrganizationProps, 'routing'> &
  __internal_RoutingOptions & {
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

export type WithInternalRouting<T> = Omit<T, 'routing'> & {
  routing?: RoutingStrategy;
};
