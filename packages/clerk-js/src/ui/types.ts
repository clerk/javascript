import type {
  CreateOrganizationProps,
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
};

export type AvailableComponentProps =
  | SignInProps
  | SignUpProps
  | UserProfileProps
  | UserButtonProps
  | OrganizationSwitcherProps
  | OrganizationProfileProps
  | CreateOrganizationProps;

type ComponentMode = 'modal' | 'mounted';
type Ctx<Props, N extends string> = Props & { componentName: N; mode?: ComponentMode };

export type SignInCtx = Ctx<SignInProps, 'SignIn'>;
export type UserProfileCtx = Ctx<UserProfileProps, 'UserProfile'>;
export type SignUpCtx = Ctx<SignUpProps, 'SignUp'>;
export type UserButtonCtx = Ctx<UserButtonProps, 'UserButton'>;
export type OrganizationProfileCtx = Ctx<OrganizationProfileProps, 'OrganizationProfile'>;
export type CreateOrganizationCtx = Ctx<CreateOrganizationProps, 'CreateOrganization'>;
export type OrganizationSwitcherCtx = Ctx<OrganizationSwitcherProps, 'OrganizationSwitcher'>;

export type AvailableComponentCtx =
  | SignInCtx
  | SignUpCtx
  | UserButtonCtx
  | UserProfileCtx
  | OrganizationProfileCtx
  | CreateOrganizationCtx
  | OrganizationSwitcherCtx;
