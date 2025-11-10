import type {
  SignInButtonProps as _SignInButtonProps,
  SignUpButtonProps as _SignUpButtonProps,
} from '@clerk/shared/types';

export type SignInButtonProps = _SignInButtonProps & {
  children?: React.ReactNode;
};

export type SignUpButtonProps = _SignUpButtonProps & {
  children?: React.ReactNode;
};
