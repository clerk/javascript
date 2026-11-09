import type { ReactElement } from 'react';

import { useMessages } from '../../localization';
import type { ButtonProps } from '../../primitives/button';
import { Button } from '../../primitives/button';
import { mergeProps } from '../../primitives/utils';

export type SignInButtonElementProps = Omit<ButtonProps, 'ref'>;

export interface SignInButtonViewProps extends SignInButtonElementProps {
  onSignIn: () => void;
  isPending?: boolean;
}

export function SignInButtonView({
  onSignIn,
  isPending = false,
  disabled = false,
  children,
  ...props
}: SignInButtonViewProps): ReactElement {
  const m = useMessages('signInButton');

  return (
    <Button
      {...mergeProps<'button'>({ onClick: onSignIn }, props)}
      disabled={disabled || isPending}
    >
      {children ?? m.label}
    </Button>
  );
}
