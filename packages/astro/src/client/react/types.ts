import type { SignInProps, SignUpProps } from '@clerk/types';

type ButtonProps = {
  mode?: 'redirect' | 'modal';
  children?: React.ReactNode;
};

export type SignInButtonProps = ButtonProps &
  Pick<
    SignInProps,
    'fallbackRedirectUrl' | 'forceRedirectUrl' | 'signUpForceRedirectUrl' | 'signUpFallbackRedirectUrl'
  >;

export type SignUpButtonProps = {
  unsafeMetadata?: SignUpUnsafeMetadata;
} & ButtonProps &
  Pick<
    SignUpProps,
    'fallbackRedirectUrl' | 'forceRedirectUrl' | 'signInForceRedirectUrl' | 'signInFallbackRedirectUrl'
  >;
