import type {
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
} from '@clerk/types';

export type { SignInProps, SignUpProps, UserButtonProps, UserProfileProps };

export type AvailableComponentProps =
  | SignInProps
  | SignUpProps
  | UserProfileProps
  | UserButtonProps;

export type SignInCtx = SignInProps & {
  componentName: 'SignIn';
};

export type UserProfileCtx = UserProfileProps & {
  componentName: 'UserProfile';
};

export type SignUpCtx = SignUpProps & {
  componentName: 'SignUp';
};

export type UserButtonCtx = UserButtonProps & {
  componentName: 'UserButton';
};

export type AvailableComponentCtx =
  | SignInCtx
  | SignUpCtx
  | UserButtonCtx
  | UserProfileCtx;
