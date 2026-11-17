import type { ReactElement } from 'react';

import { useMessages } from '../../localization';
import type { ButtonProps } from '../../primitives/button';
import { Button } from '../../primitives/button';
import { mergeProps } from '../../primitives/utils';

export type SignOutButtonElementProps = Omit<ButtonProps, 'ref'>;

export interface SignOutButtonViewProps extends SignOutButtonElementProps {
  onSignOut: () => void;
  isPending?: boolean;
}

export function SignOutButtonView({
  onSignOut,
  isPending = false,
  disabled = false,
  children,
  ...props
}: SignOutButtonViewProps): ReactElement {
  const m = useMessages('signOutButton');

  return (
    <Button
      {...mergeProps<'button'>({ onClick: onSignOut }, props)}
      disabled={disabled || isPending}
    >
      {children ?? m.label}
    </Button>
  );
}
