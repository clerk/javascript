import type { SignInProps, SignUpProps } from '@clerk/types';

// TODO-SHARED: Duplicate from @clerk/clerk-react
type ButtonProps = {
  mode?: 'redirect' | 'modal';
  children?: React.ReactNode;
};

// TODO-SHARED: Duplicate from @clerk/clerk-react
export type SignInButtonProps = ButtonProps &
  Pick<
    SignInProps,
    'fallbackRedirectUrl' | 'forceRedirectUrl' | 'signUpForceRedirectUrl' | 'signUpFallbackRedirectUrl'
  >;

// TODO-SHARED: Duplicate from @clerk/clerk-react
export type SignUpButtonProps = {
  unsafeMetadata?: SignUpUnsafeMetadata;
} & ButtonProps &
  Pick<
    SignUpProps,
    'fallbackRedirectUrl' | 'forceRedirectUrl' | 'signInForceRedirectUrl' | 'signInFallbackRedirectUrl'
  >;
