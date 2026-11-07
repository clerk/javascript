import type { ReactElement } from 'react';

import { useMessages } from '../../localization';
import type { ButtonProps } from '../../primitives/button';
import { Button } from '../../primitives/button';
import { mergeProps } from '../../primitives/utils';

export type SignInWithMetamaskButtonElementProps = Omit<ButtonProps, 'ref'>;

export interface SignInWithMetamaskButtonViewProps extends SignInWithMetamaskButtonElementProps {
  onSignIn: () => void;
  isPending?: boolean;
}

export function SignInWithMetamaskButtonView({
  onSignIn,
  isPending = false,
  disabled = false,
  children,
  ...props
}: SignInWithMetamaskButtonViewProps): ReactElement {
  const m = useMessages('signInWithMetamaskButton');

  return (
    <Button
      {...mergeProps<'button'>({ onClick: onSignIn }, props)}
      disabled={disabled || isPending}
    >
      {children ?? m.label}
    </Button>
  );
}
