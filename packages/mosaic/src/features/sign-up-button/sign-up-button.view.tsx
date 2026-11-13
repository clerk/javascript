import type { ReactElement } from 'react';

import { useMessages } from '../../localization';
import type { ButtonProps } from '../../primitives/button';
import { Button } from '../../primitives/button';
import { mergeProps } from '../../primitives/utils';

export type SignUpButtonElementProps = Omit<ButtonProps, 'ref'>;

export interface SignUpButtonViewProps extends SignUpButtonElementProps {
  onSignUp: () => void;
  isPending?: boolean;
}

export function SignUpButtonView({
  onSignUp,
  isPending = false,
  disabled = false,
  children,
  ...props
}: SignUpButtonViewProps): ReactElement {
  const m = useMessages('signUpButton');

  return (
    <Button
      {...mergeProps<'button'>({ onClick: onSignUp }, props)}
      disabled={disabled || isPending}
    >
      {children ?? m.label}
    </Button>
  );
}
