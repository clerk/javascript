import type { SignInProps, SignUpProps, UserButtonProps, UserProfileProps } from '@clerk/types';

export type { SignInProps, SignUpProps, UserButtonProps, UserProfileProps };

export type AvailableComponentProps = SignInProps | SignUpProps | UserProfileProps | UserButtonProps;

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

export type AvailableComponentCtx = SignInCtx | SignUpCtx | UserButtonCtx | UserProfileCtx;
