import type {
  CreateOrganizationProps,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
} from '@clerk/types';

export type {
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
  OrganizationSwitcherProps,
  OrganizationProfileProps,
  CreateOrganizationProps,
  OrganizationListProps,
};

export type AvailableComponentProps =
  | SignInProps
  | SignUpProps
  | UserProfileProps
  | UserButtonProps
  | OrganizationSwitcherProps
  | OrganizationProfileProps
  | CreateOrganizationProps
  | OrganizationListProps;

type ComponentMode = 'modal' | 'mounted';

export type SignInCtx = SignInProps & {
  componentName: 'SignIn';
  mode?: ComponentMode;
};

export type UserProfileCtx = UserProfileProps & {
  componentName: 'UserProfile';
  mode?: ComponentMode;
};

export type SignUpCtx = SignUpProps & {
  componentName: 'SignUp';
  mode?: ComponentMode;
};

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

export type AvailableComponentCtx =
  | SignInCtx
  | SignUpCtx
  | UserButtonCtx
  | UserProfileCtx
  | OrganizationProfileCtx
  | CreateOrganizationCtx
  | OrganizationSwitcherCtx
  | OrganizationListCtx;
